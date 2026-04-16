const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  date: {
    type: String,
    required: [true, 'Please add a date (YYYY-MM-DD)'],
  },
  time: {
    type: String,
    required: [true, 'Please add a time (e.g. 2:00 PM - 3:00 PM)'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0,
  },
  image: {
    type: String,
    default: 'default-event.jpg',
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Please add max capacity'],
    default: 100,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed', 'pending'],
    default: 'active',
  },
  assignedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema);
