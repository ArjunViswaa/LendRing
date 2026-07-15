const express = require('express');
const { createOrder, verify } = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('renter'));

router.post('/order', createOrder);
router.post('/verify', verify);

module.exports = router;