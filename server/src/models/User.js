const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['renter', 'lender', 'admin'], default: 'renter' },
        phone: String,
        city: { type: String, trim: true },
        pincode: String,
        avatarUrl: String,
        trustScore: { type: Number, default: 50, min: 0, max: 100 },
        isVerified: { type: Boolean, default: false },
        isSuspended: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);