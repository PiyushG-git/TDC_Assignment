const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, getCustomerNotes, addCustomerNote, getDashboardStats } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.get('/:id/notes', protect, getCustomerNotes);
router.post('/:id/notes', protect, addCustomerNote);

module.exports = router;
