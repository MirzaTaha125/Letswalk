const express = require('express');
const router = express.Router();
const {
  createBooking,
  verifyTicket,
  getBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBookings).post(createBooking);
router.post('/verify', protect, verifyTicket);
router.patch('/verify/:ticketNumber', protect, async (req, res) => {
  const { ticketNumber } = req.params;
  const booking = await require('../models/Booking').findOne({ ticketNumber }).populate('eventId');
  
  if (!booking) return res.status(404).json({ error: 'NotFound', message: 'Ticket not found' });
  if (booking.used) return res.status(400).json({ error: 'AlreadyUsed', message: 'Ticket already scanned' });

  booking.used = true;
  booking.scannedAt = new Date();
  await booking.save();

  res.status(200).json({ success: true, message: 'Ticket verified', data: booking });
});

module.exports = router;
