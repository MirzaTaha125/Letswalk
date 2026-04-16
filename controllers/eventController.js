const Event = require('../models/Event');
const User = require('../models/User');

// Helper to get first admin ID
const getFirstAdminId = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return admin ? admin._id : null;
};

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
const getEvents = async (req, res) => {
  const events = await Event.find({ status: 'active' }).sort({ date: 1 });
  res.status(200).json({ success: true, count: events.length, data: events });
};

// @desc    Get all events for admin dashboard
// @route   GET /api/v1/events/admin
// @access  Private
const getAdminEvents = async (req, res) => {
  let query = {};

  // If user is not admin, only show assigned events
  if (req.user.role === 'user') {
    query.assignedUser = req.user.id;
  }

  const events = await Event.find(query)
    .populate('assignedUser', 'name email')
    .sort({ date: 1 });
  res.status(200).json({ success: true, count: events.length, data: events });
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
const getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id).populate('assignedUser', 'name email');
  if (!event) {
    return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
  }
  res.status(200).json({ success: true, data: event });
};

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  // If no assigned user, default to first admin
  if (!req.body.assignedUser || req.body.assignedUser === '') {
    req.body.assignedUser = await getFirstAdminId();
  }
  
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, data: event });
};

// @desc    Update event
// @route   PATCH /api/v1/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  // If assignedUser is explicitly cleared, default to first admin
  if (req.body.assignedUser === '' || req.body.assignedUser === null) {
    req.body.assignedUser = await getFirstAdminId();
  }

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) {
    return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
  }
  res.status(200).json({ success: true, data: event });
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
  }
  res.status(200).json({ success: true, message: 'Event deleted' });
};

module.exports = {
  getEvents,
  getAdminEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
