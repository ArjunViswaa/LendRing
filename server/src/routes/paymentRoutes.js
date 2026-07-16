const express = require('express');
const { createOrder, verify, earnings, allPayments } = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/order', requireRole('renter'), createOrder);
router.post('/verify', requireRole('renter'), verify);
router.get('/earnings', requireRole('lender'), earnings);
router.get('/all', requireRole('admin'), allPayments);

module.exports = router;