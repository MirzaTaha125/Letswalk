const PRINTFUL_API = 'https://api.printful.com';

const getHeaders = () => ({
  Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
  'Content-Type': 'application/json',
});

const printfulFetch = async (path, options = {}) => {
  const res = await fetch(`${PRINTFUL_API}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.result || `Printful API error: ${res.status}`);
  }
  return data.result;
};

// In-memory cache: productId -> { front, back, generatedAt }
const mockupCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getProducts = async () => {
  return printfulFetch('/store/products');
};

const getProductById = async (id) => {
  return printfulFetch(`/store/products/${id}`);
};

const getVariantById = async (variantId) => {
  return printfulFetch(`/products/variant/${variantId}`);
};

const createOrder = async (orderData) => {
  return printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

const getOrderById = async (orderId) => {
  return printfulFetch(`/orders/${orderId}`);
};

const getShippingRates = async (recipient, items) => {
  return printfulFetch('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify({ recipient, items }),
  });
};

// Poll mockup task until completed or timeout
const pollMockupTask = async (taskKey, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const result = await printfulFetch(`/mockup-generator/task?task_key=${taskKey}`);
    if (result.status === 'completed') return result;
    if (result.status === 'failed') throw new Error('Mockup generation failed');
  }
  throw new Error('Mockup generation timed out');
};

// Generate back mockup for a product — uses catalog product_id (not sync product id)
const generateBackMockups = async (syncProductId, variants) => {
  const cacheKey = String(syncProductId);
  const cached = mockupCache.get(cacheKey);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL) {
    return cached.mockups;
  }

  try {
    // Find variants that have a back design file
    const variantsWithBack = variants.filter((v) =>
      v.files?.some((f) => f.type === 'back' && f.preview_url)
    );
    if (!variantsWithBack.length) return {};

    const firstVariant = variantsWithBack[0];
    const backFile = firstVariant.files.find((f) => f.type === 'back');

    // Catalog product_id (e.g. 782) — needed by mockup generator
    const catalogProductId = firstVariant.product?.product_id;
    if (!catalogProductId) return {};

    // All catalog variant_ids
    const variantIds = variantsWithBack.map((v) => v.variant_id);

    const taskBody = {
      variant_ids: variantIds,
      format: 'jpg',
      files: [
        {
          placement: 'back',
          image_url: backFile.preview_url,
          position: {
            area_width: 1800,
            area_height: 2400,
            width: 1800,
            height: 2400,
            top: 0,
            left: 0,
          },
        },
      ],
    };

    const task = await printfulFetch(
      `/mockup-generator/create-task/${catalogProductId}`,
      { method: 'POST', body: JSON.stringify(taskBody) }
    );

    const completed = await pollMockupTask(task.task_key);

    // Build catalogVariantId -> mockup URL map
    // Response: mockups[].variant_ids[] + mockups[].mockup_url
    const mockups = {};
    for (const m of completed.mockups || []) {
      const url = m.mockup_url;
      if (!url) continue;
      for (const vid of m.variant_ids || []) {
        mockups[vid] = url;
      }
    }

    mockupCache.set(cacheKey, { mockups, generatedAt: Date.now() });
    return mockups;
  } catch (err) {
    console.error('Back mockup generation error:', err.message);
    return {};
  }
};

module.exports = {
  getProducts,
  getProductById,
  getVariantById,
  createOrder,
  getOrderById,
  getShippingRates,
  generateBackMockups,
};
