const mongoose = require('mongoose');

const shopOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, default: '' },
  shippingAddress: {
    address1: String,
    city: String,
    stateCode: String,
    zip: String,
    countryCode: String,
  },
  items: [
    {
      productName: String,
      variantId: Number,
      size: String,
      color: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number, default: 0 },
  paypalOrderId: { type: String, required: true },
  printfulOrderId: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'fulfilled', 'shipped', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShopOrder', shopOrderSchema);
