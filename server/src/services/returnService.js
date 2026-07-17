const razorpay = require('../config/razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { countDays } = require('../utils/dates');
const { recomputeTrustScore } = require('./trustScoreService');

const DAY_MS = 1000 * 60 * 60 * 24;

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function confirmReturn(bookingId, lenderId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw httpError(404, 'Booking not found');
    if (booking.lenderId.toString() !== lenderId) {
        throw httpError(403, 'This booking does not involve you');
    }

    if (!['active', 'returnRequested'].includes(booking.status)) {
        throw httpError(409, `A ${booking.status} booking cannot be settled`);
    }

    const charge = await Payment.findOne({ bookingId, type: 'charge', status: 'paid' });
    if (!charge) throw httpError(409, 'No captured payment found for this booking');

    const returnedAt = booking.returnMarkedAt || new Date();
    const lateDays = Math.max(0, Math.floor((returnedAt - booking.endDate) / DAY_MS));
    const dailyRate = Math.round(booking.rentAmount / countDays(booking.startDate, booking.endDate));
    const latePenalty = Math.min(lateDays * dailyRate, booking.depositAmount);
    const refundAmount = booking.depositAmount - latePenalty;

    if (refundAmount > 0) {
        const refund = await razorpay.payments.refund(charge.razorpayPaymentId, {
            amount: refundAmount,
        });
        await Payment.create({
            bookingId,
            type: 'depositRefund',
            amount: refundAmount,
            razorpayRefundId: refund.id,
            status: 'refunded',
        });
    }

    if (latePenalty > 0) {
        await Payment.create({
            bookingId,
            type: 'penaltyDeduction',
            amount: latePenalty,
            status: 'paid',
        });
    }

    await Payment.create({
        bookingId,
        type: 'lenderPayout',
        amount: booking.rentAmount - booking.platformFee + latePenalty,
        status: 'created',
    });

    await recomputeTrustScore(booking.renterId);
    await recomputeTrustScore(booking.lenderId);

    booking.status = 'completed';
    booking.lateDays = lateDays;
    booking.latePenalty = latePenalty;
    booking.returnMarkedAt = returnedAt;
    booking.returnConfirmedAt = new Date();
    return booking.save();
}

module.exports = { confirmReturn };