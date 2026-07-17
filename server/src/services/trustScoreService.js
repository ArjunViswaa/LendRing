const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

async function recomputeTrustScore(userId) {
    const id = userId.toString();

    const reviews = await Review.find({ toUserId: id }).select('rating');
    const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    const ratingTerm = avgRating === null ? 0 : (avgRating - 3) * 10;

    const renterBookings = await Booking.find({ renterId: id, status: 'completed' }).select('lateDays');
    const onTimeReturns = renterBookings.filter((b) => !b.lateDays).length;
    const lateReturns = renterBookings.length - onTimeReturns;

    const disputes = await Dispute.find({ status: 'resolved' }).populate('bookingId', 'renterId lenderId');
    let disputesLost = 0;
    for (const d of disputes) {
        const b = d.bookingId;
        if (!b) continue;
        if (b.renterId.toString() === id && d.resolution.lenderCompensation > 0) disputesLost += 1;
        if (b.lenderId.toString() === id && d.raisedBy.toString() === id && d.resolution.lenderCompensation === 0) disputesLost += 1;
    }

    const raw = 50 + ratingTerm + Math.min(onTimeReturns * 2, 20) - lateReturns * 5 - disputesLost * 10;
    const trustScore = Math.round(Math.max(0, Math.min(100, raw)));

    await User.updateOne({ _id: id }, { trustScore });
    return trustScore;
}

module.exports = { recomputeTrustScore };