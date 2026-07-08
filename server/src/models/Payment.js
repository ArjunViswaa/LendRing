const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
        type: {
            type: String,
            enum: ['charge', 'depositRefund', 'lenderPayout', 'penaltyDeduction'],
            required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        split: {
            lenderPayable: Number,
            platformFee: Number,
            heldDeposit: Number,
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpayRefundId: String,
        status: { type: String, enum: ['created', 'paid', 'refunded', 'failed'], default: 'created' },
        processedEventIds: [String],
    },
    { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);