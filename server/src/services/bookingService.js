const Booking = require('../models/Booking');
const Item = require('../models/Item');
const { countDays, todayUtc } = require('../utils/dates');

const PLATFORM_FEE_PERCENT = 10;
const BLOCKING_STATUSES = ['approved', 'paid', 'active', 'returnRequested', 'disputed'];

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function hasDateConflict(itemId, startDate, endDate) {
    const clash = await Booking.exists({
        itemId,
        status: { $in: BLOCKING_STATUSES },
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    });

    return Boolean(clash);
}

async function requestBooking(renterId, { itemId, startDate, endDate }) {
    const item = await Item.findOne({ _id: itemId, status: 'active' });
    if (!item) throw httpError(404, 'This listing is not available');

    if (item.lenderId.toString() === renterId) {
        throw httpError(400, 'You cannot book your own listing');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < todayUtc()) throw httpError(400, 'Bookings cannot start in the past');
    if (end < start) throw httpError(400, 'Return date must be on or after the pickup date');

    if (item.availableFrom && start < item.availableFrom) {
        throw httpError(400, 'This item is not available that early');
    }
    if (item.availableTo && end > item.availableTo) {
        throw httpError(400, 'This item is not available that late');
    }

    if (await hasDateConflict(itemId, start, end)) {
        throw httpError(409, 'Those dates are already booked for this item');
    }

    const days = countDays(start, end);
    const rentAmount = days * item.ratePerDay;
    const platformFee = Math.round((rentAmount * PLATFORM_FEE_PERCENT) / 100);

    return Booking.create({
        itemId,
        renterId,
        lenderId: item.lenderId,
        startDate: start,
        endDate: end,
        rentAmount,
        depositAmount: item.depositAmount,
        platformFee,
        totalAmount: rentAmount + item.depositAmount,
    });
}

async function getOwnedBooking(bookingId, userId, field) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw httpError(404, 'Booking not found');
    if (booking[field].toString() !== userId) {
        throw httpError(403, 'This booking does not involve you');
    }

    return booking;
}

async function approveBooking(bookingId, lenderId) {
    const booking = await getOwnedBooking(bookingId, lenderId, 'lenderId');

    if (booking.status !== 'requested') {
        throw httpError(409, `A ${booking.status} booking cannot be approved`);
    }

    if (await hasDateConflict(booking.itemId, booking.startDate, booking.endDate)) {
        throw httpError(409, 'These dates were approved for another booking in the meantime');
    }

    booking.status = 'approved';

    return booking.save();
}

async function declineBooking(bookingId, lenderId) {
    const booking = await getOwnedBooking(bookingId, lenderId, 'lenderId');

    if (booking.status !== 'requested') {
        throw httpError(409, `A ${booking.status} booking cannot be declined`);
    }

    booking.status = 'declined';

    return booking.save();
}

async function cancelBooking(bookingId, renterId) {
    const booking = await getOwnedBooking(bookingId, renterId, 'renterId');

    if (!['requested', 'approved'].includes(booking.status)) {
        throw httpError(409, `A ${booking.status} booking cannot be cancelled`);
    }

    booking.status = 'cancelled';
    
    return booking.save();
}

async function getRenterBookings(renterId) {
    return Booking.find({ renterId })
        .sort({ createdAt: -1 })
        .populate('itemId', 'title photos ratePerDay city');
}

async function getLenderBookings(lenderId) {
    return Booking.find({ lenderId })
        .sort({ createdAt: -1 })
        .populate('itemId', 'title photos')
        .populate('renterId', 'name trustScore city');
}

module.exports = {
    requestBooking,
    approveBooking,
    declineBooking,
    cancelBooking,
    getRenterBookings,
    getLenderBookings,
};