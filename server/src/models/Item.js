const mongoose = require('mongoose');

const CATEGORIES = ['electronics', 'tools', 'outdoor', 'events', 'sports', 'other'];

const itemSchema = new mongoose.Schema(
    {
        lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: { type: String, enum: CATEGORIES, required: true },
        photos: [String],
        ratePerDay: { type: Number, required: true, min: 0 },
        depositAmount: { type: Number, required: true, min: 0 },
        availableFrom: Date,
        availableTo: Date,
        city: { type: String, trim: true },
        pincode: String,
        status: { type: String, enum: ['active', 'unlisted', 'suspended'], default: 'active' },
        avgRating: { type: Number, default: 0 },
    },
    { timestamps: true }
);

itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ category: 1, city: 1, ratePerDay: 1 });
itemSchema.index({ lenderId: 1 });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;