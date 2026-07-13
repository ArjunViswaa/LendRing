const Item = require('../models/Item');
const Booking = require('../models/Booking');
const User = require('../models/User');
const imageService = require('./imageService');

const EDITABLE_FIELDS = [
    'title',
    'description',
    'category',
    'ratePerDay',
    'depositAmount',
    'availableFrom',
    'availableTo',
    'city',
    'pincode',
];

const BLOCKING_STATUSES = ['requested', 'approved', 'paid', 'active', 'returnRequested', 'disputed'];

const MAX_PHOTOS = 5;

async function getOwnedItem(itemId, lenderId) {
    const item = await Item.findById(itemId);

    if (!item) {
        const err = new Error('Item not found');
        err.status = 404;
        throw err;
    }
    if (item.lenderId.toString() !== lenderId) {
        const err = new Error('This listing belongs to another lender');
        err.status = 403;
        throw err;
    }
    return item;
}

async function createItem(lenderId, details) {
    const fields = {};
    for (const field of EDITABLE_FIELDS) {
        if (details[field] !== undefined) {
            fields[field] = details[field];
        }
    }

    if (!fields.city || !fields.pincode) {
        const lender = await User.findById(lenderId).select('city pincode');
        fields.city = fields.city || lender.city;
        fields.pincode = fields.pincode || lender.pincode;
    }

    return Item.create({ ...fields, lenderId });
}

async function getLenderItems(lenderId) {
    return Item.find({ lenderId }).sort({ createdAt: -1 });
}

async function updateItem(itemId, lenderId, updates) {
    const item = await getOwnedItem(itemId, lenderId);

    for (const field of EDITABLE_FIELDS) {
        if (updates[field] !== undefined) {
            item[field] = updates[field];
        }
    }

    if (updates.status && ['active', 'unlisted'].includes(updates.status)) {
        item.status = updates.status;
    }

    return item.save();
}

async function deleteItem(itemId, lenderId) {
    const item = await getOwnedItem(itemId, lenderId);

    const activeBookings = await Booking.countDocuments({
        itemId: item._id,
        status: { $in: BLOCKING_STATUSES },
    });
    if (activeBookings > 0) {
        const err = new Error('This item has active bookings - unlist it instead');
        err.status = 409;
        throw err;
    }

    await item.deleteOne();
}

async function addPhotos(itemId, lenderId, fileBuffers) {
    const item = await getOwnedItem(itemId, lenderId);

    if (item.photos.length + fileBuffers.length > MAX_PHOTOS) {
        const err = new Error(`A listing can have at most ${MAX_PHOTOS} photos`);
        err.status = 400;
        throw err;
    }

    const uploadedUrls = await Promise.all(
        fileBuffers.map((buffer) => imageService.uploadImage(buffer))
    );

    item.photos.push(...uploadedUrls);
    return item.save();
}

async function removePhoto(itemId, lenderId, photoUrl) {
    const item = await getOwnedItem(itemId, lenderId);

    const before = item.photos.length;
    item.photos = item.photos.filter((url) => url !== photoUrl);

    if (item.photos.length === before) {
        const err = new Error('That photo is not on this listing');
        err.status = 404;
        throw err;
    }

    return item.save();
}

module.exports = { createItem, getLenderItems, getOwnedItem, updateItem, deleteItem, addPhotos, removePhoto };