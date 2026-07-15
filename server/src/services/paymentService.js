const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function createOrderForBooking(bookingId, renterId) {
    const booking = await Booking.findById(bookingId).populate('itemId', 'title');
    if (!booking) throw httpError(404, 'Booking not found');
    if (booking.renterId.toString() !== renterId) {
        throw httpError(403, 'This booking does not involve you');
    }
    if (booking.status !== 'approved') {
        throw httpError(409, `A ${booking.status} booking cannot be paid for`);
    }

    let payment = await Payment.findOne({ bookingId, type: 'charge', status: 'created' });

    if (!payment) {
        const order = await razorpay.orders.create({
            amount: booking.totalAmount,
            currency: 'INR',
            receipt: booking._id.toString(),
        });

        payment = await Payment.create({
            bookingId,
            type: 'charge',
            amount: booking.totalAmount,
            split: {
                lenderPayable: booking.rentAmount - booking.platformFee,
                platformFee: booking.platformFee,
                heldDeposit: booking.depositAmount,
            },
            razorpayOrderId: order.id,
        });
    }

    return {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: 'INR',
        itemTitle: booking.itemId?.title || 'Lend-Ring rental',
    };
}

async function verifyPayment(renterId, { orderId, paymentId, signature }) {
    const payment = await Payment.findOne({ razorpayOrderId: orderId, type: 'charge' });
    if (!payment) throw httpError(404, 'No payment found for this order');

    const booking = await Booking.findById(payment.bookingId);
    if (booking.renterId.toString() !== renterId) {
        throw httpError(403, 'This payment does not involve you');
    }

    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!valid) {
        payment.status = 'failed';
        await payment.save();
        throw httpError(400, 'Payment signature verification failed');
    }

    payment.status = 'paid';
    payment.razorpayPaymentId = paymentId;
    await payment.save();

    booking.status = 'paid';
    await booking.save();

    return booking;
}

module.exports = { createOrderForBooking, verifyPayment };