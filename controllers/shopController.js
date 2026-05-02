const printful = require('../lib/printfulService');

const getProducts = async (req, res) => {
  const products = await printful.getProducts();

  const detailed = await Promise.all(
    products.map(async (p) => {
      try {
        const full = await printful.getProductById(p.id);
        const variants = full.sync_variants || [];
        const prices = variants
          .map((v) => parseFloat(v.retail_price || '0'))
          .filter((n) => n > 0);

        const firstVariant = variants[0];
        const mockupFile = firstVariant?.files?.find((f) =>
          f.type === 'mockup' || f.type === 'preview'
        );
        const mockupImage = mockupFile?.preview_url || p.thumbnail_url || '';

        return {
          ...p,
          min_price: prices.length ? Math.min(...prices).toFixed(2) : '0.00',
          currency: variants[0]?.currency || 'USD',
          mockup_url: mockupImage,
        };
      } catch {
        return { ...p, min_price: '0.00', currency: 'USD' };
      }
    })
  );

  res.json({ success: true, data: detailed });
};

const getProduct = async (req, res) => {
  const full = await printful.getProductById(req.params.id);
  const variants = full.sync_variants || [];

  // Generate back mockups (cached after first call)
  const backMockups = await printful.generateBackMockups(req.params.id, variants);

  // Attach back_mockup_url to each variant
  const enrichedVariants = variants.map((v) => ({
    ...v,
    back_mockup_url: backMockups[v.variant_id] || null,
  }));

  res.json({
    success: true,
    data: { ...full, sync_variants: enrichedVariants },
  });
};

const createOrder = async (req, res) => {
  const { recipient, items, paypalOrderId } = req.body;

  if (!recipient || !items || !paypalOrderId) {
    return res.status(400).json({ message: 'recipient, items, and paypalOrderId are required' });
  }

  const order = await printful.createOrder({ recipient, items, retail_costs: { currency: 'USD' } });
  res.status(201).json({ success: true, data: order });
};

const getOrder = async (req, res) => {
  const order = await printful.getOrderById(req.params.id);
  res.json({ success: true, data: order });
};

const getShippingRates = async (req, res) => {
  const { recipient, items } = req.body;
  if (!recipient || !items) {
    return res.status(400).json({ message: 'recipient and items are required' });
  }
  const rates = await printful.getShippingRates(recipient, items);
  res.json({ success: true, data: rates });
};

module.exports = { getProducts, getProduct, createOrder, getOrder, getShippingRates };
