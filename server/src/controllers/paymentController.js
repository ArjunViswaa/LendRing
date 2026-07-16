const paymentService = require('../services/paymentService');

async function createOrder(req, res, next) {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });

        const order = await paymentService.createOrderForBooking(bookingId, req.user.id);
        res.status(201).json({ order });
    } catch (err) {
        next(err);
    }
}

async function verify(req, res, next) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification fields' });
        }

        const booking = await paymentService.verifyPayment(req.user.id, {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });
        res.json({ booking });
    } catch (err) {
        next(err);
    }
}

async function earnings(req, res, next) {
    try {
        res.json(await paymentService.getLenderEarnings(req.user.id));
    } catch (err) {
        next(err);
    }
}

async function allPayments(req, res, next) {
    try {
        res.json(await paymentService.getAllPayments(req.query.page));
    } catch (err) {
        next(err);
    }
}

module.exports = { createOrder, verify, earnings, allPayments };