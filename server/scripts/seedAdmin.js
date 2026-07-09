require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email });
    if (existing) {
        console.log(`Admin already exists (${email}) - nothing to do`);
        process.exit(0);
    }

    await User.create({
        name: 'Platform Admin',
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        isVerified: true,
    });

    console.log(`Admin account created: ${email}`);
    process.exit(0);
}

seedAdmin();