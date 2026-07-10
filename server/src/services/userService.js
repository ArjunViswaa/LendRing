const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const EDITABLE_FIELDS = ['name', 'phone', 'city', 'pincode', 'avatarUrl'];

async function getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return user;
}

async function updateProfile(userId, updates) {
    const allowed = {};
    for (const field of EDITABLE_FIELDS) {
        if (updates[field] !== undefined) {
            allowed[field] = updates[field];
        }
    }

    const user = await User.findByIdAndUpdate(userId, allowed, {
        returnDocument: 'after',
        runValidators: true,
    }).select('-passwordHash');

    return user;
}

async function changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOk) {
        const err = new Error('Current password is incorrect');
        err.status = 401;
        throw err;
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
}

module.exports = { getProfile, updateProfile, changePassword };