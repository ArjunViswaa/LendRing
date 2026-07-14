const Item = require('../models/Item');
const escapeRegex = require('../utils/escapeRegex');

const MAX_PER_PAGE = 48;

async function searchItems(filters) {
    const query = { status: 'active' };

    if (filters.search) {
        query.$text = { $search: filters.search };
    }
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.city) {
        query.city = new RegExp(`^${escapeRegex(filters.city)}$`, 'i');
    }
    if (filters.minRate || filters.maxRate) {
        query.ratePerDay = {};
        if (filters.minRate) query.ratePerDay.$gte = Number(filters.minRate);
        if (filters.maxRate) query.ratePerDay.$lte = Number(filters.maxRate);
    }

    const perPage = Math.min(Number(filters.limit) || 12, MAX_PER_PAGE);
    const page = Math.max(Number(filters.page) || 1, 1);

    const [items, total] = await Promise.all([
        Item.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage),
        Item.countDocuments(query),
    ]);

    return { items, total, page, pages: Math.ceil(total / perPage) };
}

async function getItemDetail(itemId) {
    const item = await Item.findOne({ _id: itemId, status: 'active' }).populate(
        'lenderId',
        'name city trustScore createdAt'
    );

    if (!item) {
        const err = new Error('This listing is not available');
        err.status = 404;
        throw err;
    }
    return item;
}

module.exports = { searchItems, getItemDetail };