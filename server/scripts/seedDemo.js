require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Item = require('../src/models/Item');

const DEMO_PASSWORD = 'demo1234';

const demoUsers = [
    { name: 'Ravi Kumar', email: 'ravi.lender@demo.dev', role: 'lender', city: 'Chennai', pincode: '600042' },
    { name: 'Priya Sharma', email: 'priya.lender@demo.dev', role: 'lender', city: 'Bengaluru', pincode: '560034' },
    { name: 'Arun Nair', email: 'arun.renter@demo.dev', role: 'renter', city: 'Chennai', pincode: '600042' },
];

const demoItems = [
    { owner: 'ravi.lender@demo.dev', title: 'Canon EOS 200D DSLR camera', description: 'Lightweight 24MP DSLR camera with 18-55mm kit lens. Battery, charger and 32GB card included. Great for trips and events.', category: 'electronics', ratePerDay: 45000, depositAmount: 300000, photoSeed: 'camera1' },
    { owner: 'ravi.lender@demo.dev', title: 'Bosch GSB 500W impact drill', description: 'Impact drill with 13mm chuck and a full bit set. Perfect for hanging shelves or small home projects.', category: 'tools', ratePerDay: 15000, depositAmount: 80000, photoSeed: 'drill7' },
    { owner: 'ravi.lender@demo.dev', title: 'Quechua 4-person camping tent', description: 'Waterproof dome tent, pitches in 10 minutes. Used twice, in great condition. Pegs and carry bag included.', category: 'outdoor', ratePerDay: 30000, depositAmount: 150000, photoSeed: 'tent3' },
    { owner: 'ravi.lender@demo.dev', title: 'Badminton set with 4 racquets', description: 'Four Yonex racquets, net and shuttles. Good for a weekend tournament with friends.', category: 'sports', ratePerDay: 8000, depositAmount: 40000, photoSeed: 'sport2' },
    { owner: 'priya.lender@demo.dev', title: 'Epson Full HD projector with screen', description: '3LCD projector with 100 inch portable screen and HDMI cables. Ideal for movie nights and presentations.', category: 'events', ratePerDay: 60000, depositAmount: 500000, photoSeed: 'proj4' },
    { owner: 'priya.lender@demo.dev', title: 'Trekking rucksack 60L', description: 'Wildcraft 60 litre rucksack with rain cover. Comfortable straps, fits cabin-plus-trek gear for a week.', category: 'outdoor', ratePerDay: 10000, depositAmount: 60000, photoSeed: 'pack9' },
    { owner: 'priya.lender@demo.dev', title: 'DJI Mini 3 drone', description: '4K camera drone under 250g, two batteries and controller. Only for open-field flying, please follow local rules.', category: 'electronics', ratePerDay: 90000, depositAmount: 800000, photoSeed: 'drone5' },
    { owner: 'priya.lender@demo.dev', title: 'Folding table + 6 chairs set', description: 'Sturdy folding table with six chairs for house parties and small functions. Fits in a hatchback boot.', category: 'events', ratePerDay: 20000, depositAmount: 100000, photoSeed: 'table6' },
];

async function seedDemo() {
    await mongoose.connect(process.env.MONGO_URI);

    const demoEmails = demoUsers.map((u) => u.email);
    const existing = await User.find({ email: { $in: demoEmails } }).select('_id');
    await Item.deleteMany({ lenderId: { $in: existing.map((u) => u._id) } });
    await User.deleteMany({ email: { $in: demoEmails } });
    console.log('cleared old demo data');

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const users = await User.insertMany(
        demoUsers.map((u) => ({ ...u, passwordHash, isVerified: true }))
    );
    const idByEmail = Object.fromEntries(users.map((u) => [u.email, u._id]));
    console.log(`created ${users.length} demo users (password: ${DEMO_PASSWORD})`);

    const items = await Item.insertMany(
        demoItems.map(({ owner, photoSeed, ...item }) => {
            const lender = demoUsers.find((u) => u.email === owner);
            return {
                ...item,
                lenderId: idByEmail[owner],
                city: lender.city,
                pincode: lender.pincode,
                photos: [
                    `https://picsum.photos/seed/${photoSeed}/800/600`,
                    `https://picsum.photos/seed/${photoSeed}b/800/600`,
                ],
            };
        })
    );
    console.log(`created ${items.length} demo listings`);

    await mongoose.disconnect();
    console.log('done');
}

seedDemo().catch((err) => {
    console.error(err);
    process.exit(1);
});