const userService = require('../services/userService');

async function getMe(req, res, next) {
    try {
        const user = await userService.getProfile(req.user.id);
        res.json({ user });
    } catch (err) {
        next(err);
    }
}

async function updateMe(req, res, next) {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.json({ user });
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        await userService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ message: 'Password updated' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getMe, updateMe, changePassword };