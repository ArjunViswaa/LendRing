const reviewService = require('../services/reviewService');

async function create(req, res, next) {
    try {
        const { bookingId, rating, comment } = req.body;
        if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'bookingId and a rating from 1 to 5 are required' });
        }
        const review = await reviewService.createReview(req.user.id, { bookingId, rating, comment });
        res.status(201).json({ review });
    } catch (err) {
        next(err);
    }
}

async function forUser(req, res, next) {
    try {
        res.json({ reviews: await reviewService.getReviewsForUser(req.params.id) });
    } catch (err) {
        next(err);
    }
}

async function given(req, res, next) {
    try {
        res.json({ bookingIds: await reviewService.getGivenReviewIds(req.user.id) });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, forUser, given };