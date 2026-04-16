const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please add a customer name'],
  },
  customerEmail: {
    type: String,
    required: [true, 'Please add a customer email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Please add an event'],
  },
  ticketNumber: {
    type: String,
    unique: true,
  },
  qrSignature: {
    type: String,
  },
  used: {
    type: Boolean,
    default: false,
  },
  scannedAt: {
    type: Date,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
