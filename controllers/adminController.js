const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  const [totalEvents, totalBookings, usedTickets, totalRevenue, totalUsers] = await Promise.all([
    Event.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ used: true }),
    Booking.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      { $group: { _id: null, total: { $sum: '$event.price' } } },
    ]),
    User.countDocuments({ role: 'user' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalEvents,
      totalBookings,
      usedTickets,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
    },
  });
};

// @desc    Get all users (role: user)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({ role: 'user' });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
};

// @desc    Create a new user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  res.status(201).json({
    success: true,
    data: user,
  });
};

// @desc    Delete a user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'NotFound', message: 'User not found' });
  }

  // Ensure we don't delete an admin
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'BadRequest', message: 'Admin users cannot be deleted' });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
};

module.exports = { getStats, getUsers, createUser, deleteUser };
