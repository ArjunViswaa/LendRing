const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const { recomputeTrustScore } = require('./trustScoreService');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function createReview(fromUserId, { bookingId, rating, comment }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw httpError(404, 'Booking not found');
    if (booking.status !== 'completed') {
        throw httpError(409, 'Reviews open once the booking is completed');
    }

    const isRenter = booking.renterId.toString() === fromUserId;
    const isLender = booking.lenderId.toString() === fromUserId;
    if (!isRenter && !isLender) throw httpError(403, 'This booking does not involve you');

    const toUserId = isRenter ? booking.lenderId : booking.renterId;

    let review;
    try {
        review = await Review.create({ bookingId, fromUserId, toUserId, rating, comment });
    } catch (err) {
        if (err.code === 11000) throw httpError(409, 'You have already reviewed this booking');
        throw err;
    }

    await recomputeTrustScore(toUserId);

    if (isRenter) {
        const itemBookingIds = await Booking.find({ itemId: booking.itemId }).distinct('_id');
        const [agg] = await Review.aggregate([
            { $match: { bookingId: { $in: itemBookingIds }, toUserId: booking.lenderId } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]);
        await Item.updateOne(
            { _id: booking.itemId },
            { avgRating: Math.round((agg?.avg || 0) * 10) / 10 }
        );
    }

    return review;
}

async function getReviewsForUser(userId) {
    return Review.find({ toUserId: userId })
        .sort({ createdAt: -1 })
        .populate('fromUserId', 'name');
}

async function getGivenReviewIds(userId) {
    return Review.find({ fromUserId: userId }).distinct('bookingId');
}

module.exports = { createReview, getReviewsForUser, getGivenReviewIds };