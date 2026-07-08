const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

function signToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_TTL,
    });
}

async function register({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, role });

    return { user, token: signToken(user) };
}

async function login({ email, password }) {
    const user = await User.findOne({ email });
    const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordOk) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }

    if (user.isSuspended) {
        const err = new Error('This account has been suspended');
        err.status = 403;
        throw err;
    }

    return { user, token: signToken(user) };
}

module.exports = { register, login };