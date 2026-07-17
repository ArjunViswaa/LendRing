const express = require('express');
const { raise, list, resolve } = require('../controllers/disputeController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('lender'), upload.array('evidence', 5), raise);
router.get('/', requireRole('admin'), list);
router.put('/:id/resolve', requireRole('admin'), resolve);

module.exports = router;