const bookingService = require('../services/bookingService');
const returnService = require('../services/returnService');
const { isValidDateString } = require('../utils/dates');

async function request(req, res, next) {
    try {
        const { itemId, startDate, endDate } = req.body;

        if (!itemId || !isValidDateString(startDate) || !isValidDateString(endDate)) {
            return res.status(400).json({ message: 'itemId, startDate and endDate (YYYY-MM-DD) are required' });
        }

        const booking = await bookingService.requestBooking(req.user.id, req.body);
        res.status(201).json({ booking });
    } catch (err) {
        next(err);
    }
}

async function mine(req, res, next) {
    try {
        res.json({ bookings: await bookingService.getRenterBookings(req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function received(req, res, next) {
    try {
        res.json({ bookings: await bookingService.getLenderBookings(req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function approve(req, res, next) {
    try {
        res.json({ booking: await bookingService.approveBooking(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function decline(req, res, next) {
    try {
        res.json({ booking: await bookingService.declineBooking(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function cancel(req, res, next) {
    try {
        res.json({ booking: await bookingService.cancelBooking(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function handover(req, res, next) {
    try {
        res.json({ booking: await bookingService.markHandover(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function markReturned(req, res, next) {
    try {
        res.json({ booking: await bookingService.markReturn(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

async function confirmReturn(req, res, next) {
    try {
        res.json({ booking: await returnService.confirmReturn(req.params.id, req.user.id) });
    } catch (err) {
        next(err);
    }
}

module.exports = { request, mine, received, approve, decline, cancel, handover, markReturned, confirmReturn };