const transporter = require('../config/mailer');
const Booking = require('../models/Booking');
const { formatPaise } = require('../utils/format');

async function sendMail(to, subject, text) {
    if (!transporter) return;
    try {
        await transporter.sendMail({
            from: `"Lend-Ring" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`email sent: "${subject}" -> ${to}`);
    } catch (err) {
        console.error(`email failed: "${subject}" -> ${to}:`, err.message);
    }
}

async function loadBooking(bookingId) {
    return Booking.findById(bookingId)
        .populate('itemId', 'title')
        .populate('renterId', 'name email')
        .populate('lenderId', 'name email');
}

async function notifyBookingRequested(bookingId) {
    const b = await loadBooking(bookingId);
    if (!b) return;
    await sendMail(
        b.lenderId.email,
        `New booking request for ${b.itemId.title}`,
        `Hi ${b.lenderId.name},\n\n` +
        `${b.renterId.name} wants to rent your "${b.itemId.title}" from ` +
        `${b.startDate.toDateString()} to ${b.endDate.toDateString()}.\n\n` +
        `You would earn ${formatPaise(b.rentAmount - b.platformFee)} after the platform fee.\n` +
        `Log in to approve or decline the request.\n\n— Lend-Ring`
    );
}

async function notifyBookingApproved(bookingId) {
    const b = await loadBooking(bookingId);
    if (!b) return;
    await sendMail(
        b.renterId.email,
        `Your booking for ${b.itemId.title} is approved`,
        `Hi ${b.renterId.name},\n\n` +
        `${b.lenderId.name} approved your booking for "${b.itemId.title}".\n` +
        `Pay ${formatPaise(b.totalAmount)} (rent + refundable deposit) to confirm it.\n\n— Lend-Ring`
    );
}

async function notifyPaymentReceived(bookingId) {
    const b = await loadBooking(bookingId);
    if (!b) return;
    await sendMail(
        b.renterId.email,
        `Payment received for ${b.itemId.title}`,
        `Hi ${b.renterId.name},\n\n` +
        `We received your payment of ${formatPaise(b.totalAmount)}. Your rental runs ` +
        `${b.startDate.toDateString()} to ${b.endDate.toDateString()}. ` +
        `The ${formatPaise(b.depositAmount)} deposit comes back after a safe return.\n\n— Lend-Ring`
    );
    await sendMail(
        b.lenderId.email,
        `${b.renterId.name} paid for ${b.itemId.title}`,
        `Hi ${b.lenderId.name},\n\n` +
        `The booking for "${b.itemId.title}" is paid and confirmed. ` +
        `Hand the item over on ${b.startDate.toDateString()}.\n\n— Lend-Ring`
    );
}

async function notifyReturnSettled(bookingId) {
    const b = await loadBooking(bookingId);
    if (!b) return;
    const refunded = b.depositAmount - b.latePenalty;
    await sendMail(
        b.renterId.email,
        `Deposit settled for ${b.itemId.title}`,
        `Hi ${b.renterId.name},\n\n` +
        (b.latePenalty > 0
            ? `Your return is settled. ${formatPaise(refunded)} of your deposit is on its way back; ${formatPaise(b.latePenalty)} was deducted.`
            : `Your return is settled and your full ${formatPaise(refunded)} deposit is on its way back.`) +
        `\n\nThanks for renting with Lend-Ring!\n\n— Lend-Ring`
    );
}

module.exports = {
    notifyBookingRequested,
    notifyBookingApproved,
    notifyPaymentReceived,
    notifyReturnSettled,
};