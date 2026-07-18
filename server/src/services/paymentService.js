const crypto = require('crypto');
const mongoose = require('mongoose');

const razorpay = require('../config/razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const emailService = require('./emailService');

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

    const wasAlreadyPaid = booking.status === 'paid';

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

    if (!wasAlreadyPaid) emailService.notifyPaymentReceived(booking._id);

    return booking;
}

async function getLenderEarnings(lenderId) {
    const lenderObjectId = new mongoose.Types.ObjectId(lenderId);

    const [summary] = await Payment.aggregate([
        { $match: { type: 'charge', status: 'paid' } },
        { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
        { $unwind: '$booking' },
        { $match: { 'booking.lenderId': lenderObjectId } },
        {
            $group: {
                _id: null,
                totalEarned: { $sum: '$split.lenderPayable' },
                feesPaid: { $sum: '$split.platformFee' },
                depositsHeld: { $sum: '$split.heldDeposit' },
                paidBookings: { $sum: 1 },
            },
        },
    ]);

    const bookingIds = await Booking.find({ lenderId }).distinct('_id');
    const payments = await Payment.find({
        bookingId: { $in: bookingIds },
        type: 'charge',
        status: 'paid',
    })
        .sort({ updatedAt: -1 })
        .populate({
            path: 'bookingId',
            select: 'startDate endDate itemId renterId',
            populate: [
                { path: 'itemId', select: 'title' },
                { path: 'renterId', select: 'name' },
            ],
        });

    return {
        summary: summary || { totalEarned: 0, feesPaid: 0, depositsHeld: 0, paidBookings: 0 },
        payments,
    };
}

async function getAllPayments(page = 1) {
    const perPage = 20;
    const currentPage = Math.max(Number(page) || 1, 1);

    const [payments, total] = await Promise.all([
        Payment.find()
            .sort({ updatedAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .populate({
                path: 'bookingId',
                select: 'itemId renterId lenderId startDate endDate',
                populate: [
                    { path: 'itemId', select: 'title' },
                    { path: 'renterId', select: 'name email' },
                    { path: 'lenderId', select: 'name email' },
                ],
            }),
        Payment.countDocuments(),
    ]);

    return { payments, total, page: currentPage, pages: Math.ceil(total / perPage) };
}

module.exports = { createOrderForBooking, verifyPayment, getLenderEarnings, getAllPayments };