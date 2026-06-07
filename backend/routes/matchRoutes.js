const express = require('express');
const router = express.Router();
const { suggestMatches, sendMatch, getAiCompatibility } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/suggest/:customerId', protect, suggestMatches);
router.post('/send', protect, sendMatch);
router.post('/ai-compatibility', protect, getAiCompatibility);

module.exports = router;
