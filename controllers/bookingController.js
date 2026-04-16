const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const qrService = require('../lib/qrService');
const pdfService = require('../lib/pdfService');
const emailService = require('../lib/emailService');

// @desc    Reserve a spot for an event
// @route   POST /api/v1/bookings
// @access  Public
const createBooking = async (req, res) => {
  const { customerName, customerEmail, eventId } = req.body;

  // 1. Validate data
  if (!customerName || !customerEmail || !eventId) {
    return res.status(400).json({ error: 'BadRequest', message: 'Missing required fields' });
  }

  // 2. Check if event exists and is active
  const event = await Event.findById(eventId);
  if (!event || event.status !== 'active') {
    return res.status(404).json({ error: 'NotFound', message: 'Event not available' });
  }

  // 3. Check capacity
  const bookingCount = await Booking.countDocuments({ eventId });
  if (bookingCount >= event.maxCapacity) {
    return res.status(400).json({ error: 'FullyBooked', message: 'Event is fully booked' });
  }

  // 4. Create booking record
  const ticketNumber = uuidv4().split('-')[0].toUpperCase();
  const qrPayload = qrService.generateSignedPayload(ticketNumber, eventId);
  
  const booking = await Booking.create({
    customerName,
    customerEmail,
    eventId,
    ticketNumber,
    qrSignature: qrPayload,
  });

  // 5. Generate QR and PDF asynchronously (to respond faster)
  try {
    const qrDataUrl = await qrService.generateQRCodeImage(qrPayload);
    const pdfBuffer = await pdfService.generateTicketPDF(booking, event, qrDataUrl);
    
    // 6. Send Email
    await emailService.sendTicketEmail(customerEmail, customerName, event.title, pdfBuffer);
  } catch (error) {
    console.error('Ticket generation/email error:', error);
    // Don't fail the response, but log that ticket sending failed
  }

  res.status(201).json({ 
    success: true, 
    data: { 
      bookingId: booking._id, 
      ticketNumber: booking.ticketNumber,
      message: 'Booking successful. Ticket will be sent to your email.'
    } 
  });
};

// @desc    Verify a ticket (QR scan)
// @route   POST /api/v1/bookings/verify
// @access  Private
const verifyTicket = async (req, res) => {
  const { qrPayload } = req.body;

  if (!qrPayload) {
    return res.status(400).json({ error: 'BadRequest', message: 'No QR payload provided' });
  }

  // 1. Verify signature
  const isValidSignature = qrService.verifyPayload(qrPayload);
  if (!isValidSignature) {
    return res.status(400).json({ error: 'InvalidTicket', message: 'QR signature invalid' });
  }

  // 2. Extract data
  const { t: ticketNumber } = JSON.parse(qrPayload);

  // 3. Find booking
  const booking = await Booking.findOne({ ticketNumber }).populate('eventId');
  if (!booking) {
    return res.status(404).json({ error: 'NotFound', message: 'Ticket record not found' });
  }

  // Role check: If user is not admin, they must be assigned to this event
  if (req.user.role === 'user') {
    if (booking.eventId.assignedUser && booking.eventId.assignedUser.toString() !== req.user.id) {
        return res.status(403).json({ 
            success: false,
            error: 'NotAssigned', 
            message: 'You are not authorized to scan tickets for this event' 
        });
    }
  }

  // 4. Check if already used
  if (booking.used) {
    return res.status(400).json({ 
      success: false,
      error: 'AlreadyUsed', 
      message: 'Ticket has already been scanned',
      scannedAt: booking.scannedAt
    });
  }

  // 5. Mark as used
  booking.used = true;
  booking.scannedAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Ticket verified successfully',
    data: {
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      eventTitle: booking.eventId.title,
      scannedAt: booking.scannedAt
    }
  });
};

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
const getBookings = async (req, res) => {
    let query = {};
    
    // If user is not admin, only show bookings for assigned events
    if (req.user.role === 'user') {
        const assignedEvents = await Event.find({ assignedUser: req.user.id }).select('_id');
        const eventIds = assignedEvents.map(e => e._id);
        query.eventId = { $in: eventIds };
    }

    const bookings = await Booking.find(query)
        .populate({
            path: 'eventId',
            populate: { path: 'assignedUser', select: 'name' }
        })
        .sort({ bookedAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
};

module.exports = {
  createBooking,
  verifyTicket,
  getBookings
};
