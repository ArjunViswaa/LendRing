const authService = require('../services/authService');

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        trustScore: user.trustScore,
    };
}

async function register(req, res, next) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (role && !['renter', 'lender'].includes(role)) {
            return res.status(400).json({ message: 'Role must be renter or lender' });
        }

        const { user, token } = await authService.register({ name, email, password, role });
        res.status(201).json({ token, user: publicUser(user) });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const { user, token } = await authService.login({ email, password });
        res.json({ token, user: publicUser(user) });
    } catch (err) {
        next(err);
    }
}

async function me(req, res) {
    res.json({ user: req.user });
}

module.exports = { register, login, me };