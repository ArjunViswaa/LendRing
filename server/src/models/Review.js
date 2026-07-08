const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
        fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

reviewSchema.index({ bookingId: 1, fromUserId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);