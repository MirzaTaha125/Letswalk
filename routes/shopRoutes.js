const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createOrder, getOrder, getShippingRates } = require('../controllers/shopController');

router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.post('/shipping-rates', getShippingRates);

module.exports = router;
