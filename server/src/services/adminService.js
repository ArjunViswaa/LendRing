const User = require('../models/User');
const Item = require('../models/Item');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

const PER_PAGE = 20;

async function listUsers({ search, role, page }) {
    const query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
        ];
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const [users, total] = await Promise.all([
        User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * PER_PAGE)
            .limit(PER_PAGE),
        User.countDocuments(query),
    ]);

    return { users, total, page: currentPage, pages: Math.ceil(total / PER_PAGE) };
}

async function setUserFlags(userId, { isVerified, isSuspended }) {
    const user = await User.findById(userId);
    if (!user) throw httpError(404, 'User not found');
    if (user.role === 'admin') throw httpError(403, 'Admin accounts cannot be modified here');

    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (typeof isSuspended === 'boolean') user.isSuspended = isSuspended;

    await user.save();
    return User.findById(userId).select('-passwordHash');
}

async function listItems({ status, page }) {
    const query = status ? { status } : {};
    const currentPage = Math.max(Number(page) || 1, 1);

    const [items, total] = await Promise.all([
        Item.find(query)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * PER_PAGE)
            .limit(PER_PAGE)
            .populate('lenderId', 'name email trustScore'),
        Item.countDocuments(query),
    ]);

    return { items, total, page: currentPage, pages: Math.ceil(total / PER_PAGE) };
}

async function setItemStatus(itemId, status) {
    if (!['active', 'suspended'].includes(status)) {
        throw httpError(400, 'Status must be active or suspended');
    }
    const item = await Item.findByIdAndUpdate(itemId, { status }, { returnDocument: 'after' });
    if (!item) throw httpError(404, 'Item not found');
    return item;
}

module.exports = { listUsers, setUserFlags, listItems, setItemStatus };