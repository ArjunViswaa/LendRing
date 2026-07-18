const razorpay = require('../config/razorpay');
const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const imageService = require('./imageService');
const { recomputeTrustScore } = require('./trustScoreService');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function raiseDispute(lenderId, { bookingId, reason, description }, fileBuffers = []) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw httpError(404, 'Booking not found');
    if (booking.lenderId.toString() !== lenderId) {
        throw httpError(403, 'This booking does not involve you');
    }
    if (!['active', 'returnRequested'].includes(booking.status)) {
        throw httpError(409, `A ${booking.status} booking cannot be disputed`);
    }

    const existing = await Dispute.findOne({ bookingId });
    if (existing) throw httpError(409, 'A dispute already exists for this booking');

    const evidencePhotos = await Promise.all(
        fileBuffers.map((buffer) => imageService.uploadImage(buffer, 'lend-ring/evidence'))
    );

    const dispute = await Dispute.create({
        bookingId,
        raisedBy: lenderId,
        reason,
        description,
        evidencePhotos,
    });

    booking.status = 'disputed';
    await booking.save();

    return dispute;
}

async function listDisputes(status) {
    const query = status ? { status } : {};
    return Dispute.find(query)
        .sort({ createdAt: -1 })
        .populate({
            path: 'bookingId',
            select: 'itemId renterId lenderId startDate endDate depositAmount rentAmount platformFee',
            populate: [
                { path: 'itemId', select: 'title photos' },
                { path: 'renterId', select: 'name email trustScore' },
                { path: 'lenderId', select: 'name email trustScore' },
            ],
        });
}

async function resolveDispute(disputeId, adminId, { renterRefund, lenderCompensation, notes }) {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw httpError(404, 'Dispute not found');
    if (dispute.status === 'resolved') throw httpError(409, 'This dispute is already resolved');

    const booking = await Booking.findById(dispute.bookingId);

    if (!Number.isInteger(renterRefund) || !Number.isInteger(lenderCompensation) ||
        renterRefund < 0 || lenderCompensation < 0) {
        throw httpError(400, 'Refund and compensation must be non-negative integers in paise');
    }

    if (renterRefund + lenderCompensation !== booking.depositAmount) {
        throw httpError(400, `Refund + compensation must equal the deposit (${booking.depositAmount} paise)`);
    }

    const charge = await Payment.findOne({ bookingId: booking._id, type: 'charge', status: 'paid' });
    if (!charge) throw httpError(409, 'No captured payment found for this booking');

    const claimed = await Dispute.findOneAndUpdate(
        { _id: disputeId, status: 'open' },
        { status: 'resolved', resolution: { renterRefund, lenderCompensation, notes, resolvedBy: adminId } },
        { returnDocument: 'after' }
    );
    if (!claimed) throw httpError(409, 'This dispute is already resolved');

    try {
        if (renterRefund > 0) {
            const refund = await razorpay.payments.refund(charge.razorpayPaymentId, { amount: renterRefund });
            await Payment.create({
                bookingId: booking._id,
                type: 'depositRefund',
                amount: renterRefund,
                razorpayRefundId: refund.id,
                status: 'refunded',
            });
        }

        if (lenderCompensation > 0) {
            await Payment.create({
                bookingId: booking._id,
                type: 'penaltyDeduction',
                amount: lenderCompensation,
                status: 'paid',
            });
        }

        await Payment.create({
            bookingId: booking._id,
            type: 'lenderPayout',
            amount: booking.rentAmount - booking.platformFee + lenderCompensation,
            status: 'created',
        });

        booking.status = 'completed';
        booking.latePenalty = lenderCompensation;
        booking.returnConfirmedAt = new Date();
        await booking.save();
    } catch (err) {
        await Dispute.updateOne({ _id: disputeId }, { status: 'open', $unset: { resolution: 1 } });
        throw err;
    }

    await recomputeTrustScore(booking.renterId);
    await recomputeTrustScore(booking.lenderId);

    return claimed;
}

module.exports = { raiseDispute, listDisputes, resolveDispute };