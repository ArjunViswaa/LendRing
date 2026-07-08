const mongoose = require('mongoose');

const BOOKING_STATUSES = [
    'requested',
    'approved',
    'paid',
    'active',
    'returnRequested',
    'completed',
    'declined',
    'cancelled',
    'disputed',
];

const bookingSchema = new mongoose.Schema(
    {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: { type: String, enum: BOOKING_STATUSES, default: 'requested' },
        rentAmount: { type: Number, required: true, min: 0 },
        depositAmount: { type: Number, required: true, min: 0 },
        platformFee: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        lateDays: { type: Number, default: 0 },
        latePenalty: { type: Number, default: 0 },
        returnMarkedAt: Date,
        returnConfirmedAt: Date,
    },
    { timestamps: true }
);

bookingSchema.index({ itemId: 1, status: 1 });
bookingSchema.index({ renterId: 1 });
bookingSchema.index({ lenderId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;