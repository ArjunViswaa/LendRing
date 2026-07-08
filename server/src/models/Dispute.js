const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true,
        },
        raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, enum: ['damage', 'notReturned', 'other'], required: true },
        description: { type: String, required: true },
        evidencePhotos: [String],
        status: { type: String, enum: ['open', 'resolved'], default: 'open' },
        resolution: {
            renterRefund: Number,
            lenderCompensation: Number,
            notes: String,
            resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);