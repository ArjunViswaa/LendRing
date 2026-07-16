const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function verifyWebhookSignature(rawBody, signature) {
    if (!signature) return false;

    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    return (
        expected.length === signature.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    );
}

async function handleWebhookEvent(rawBody, signature, eventId) {
    if (!verifyWebhookSignature(rawBody, signature)) {
        throw httpError(400, 'Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);

    if (!['payment.captured', 'payment.failed'].includes(event.event)) {
        return { outcome: 'ignored', event: event.event };
    }

    const entity = event.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: entity.order_id, type: 'charge' });
    if (!payment) {
        return { outcome: 'unknown-order' };
    }

    if (eventId && payment.processedEventIds.includes(eventId)) {
        return { outcome: 'duplicate-skipped', eventId };
    }

    if (event.event === 'payment.captured') {
        payment.status = 'paid';
        payment.razorpayPaymentId = entity.id;
    } else if (payment.status === 'created') {
        payment.status = 'failed';
    }

    if (eventId) payment.processedEventIds.push(eventId);
    await payment.save();

    if (event.event === 'payment.captured') {
        await Booking.updateOne(
            { _id: payment.bookingId, status: 'approved' },
            { status: 'paid' }
        );
    }

    return { outcome: 'processed', event: event.event, eventId };
}

module.exports = { handleWebhookEvent };