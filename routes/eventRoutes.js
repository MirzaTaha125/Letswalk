const express = require('express');
const router = express.Router();
const {
  getEvents,
  getAdminEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getEvents).post(protect, authorize('admin'), createEvent);
router.get('/admin', protect, getAdminEvents);

router
  .route('/:id')
  .get(getEvent)
  .patch(protect, authorize('admin'), updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;
