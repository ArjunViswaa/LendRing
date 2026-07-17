const disputeService = require('../services/disputeService');

async function raise(req, res, next) {
    try {
        const { bookingId, reason, description } = req.body;
        if (!bookingId || !reason || !description) {
            return res.status(400).json({ message: 'bookingId, reason and description are required' });
        }

        const buffers = (req.files || []).map((f) => f.buffer);
        const dispute = await disputeService.raiseDispute(req.user.id, req.body, buffers);
        res.status(201).json({ dispute });
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        res.json({ disputes: await disputeService.listDisputes(req.query.status) });
    } catch (err) {
        next(err);
    }
}

async function resolve(req, res, next) {
    try {
        const dispute = await disputeService.resolveDispute(req.params.id, req.user.id, req.body);
        res.json({ dispute });
    } catch (err) {
        next(err);
    }
}

module.exports = { raise, list, resolve };