const express = require('express');
const router = express.Router();
const { getStats, getUsers, createUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', authorize('admin'), getStats);
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.delete('/users/:id', authorize('admin'), deleteUser);

module.exports = router;
