const express = require('express');
const { request, mine, received, approve, decline, cancel, handover, markReturned, confirmReturn } = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('renter'), request);
router.get('/mine', requireRole('renter'), mine);
router.get('/received', requireRole('lender'), received);

router.put('/:id/approve', requireRole('lender'), approve);
router.put('/:id/decline', requireRole('lender'), decline);
router.put('/:id/cancel', requireRole('renter'), cancel);

router.put('/:id/handover', requireRole('lender'), handover);
router.put('/:id/return', requireRole('renter'), markReturned);
router.put('/:id/confirm-return', requireRole('lender'), confirmReturn);

module.exports = router;