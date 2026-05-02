const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createOrder, getOrder, getShippingRates, getAdminOrders, updateOrderStatus } = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.post('/shipping-rates', getShippingRates);

// Admin-only routes
router.get('/admin/orders', protect, getAdminOrders);
router.patch('/admin/orders/:id', protect, updateOrderStatus);

module.exports = router;
