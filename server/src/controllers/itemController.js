const itemService = require('../services/itemService');
const { CATEGORIES } = require('../models/Item');

async function create(req, res, next) {
    try {
        const { title, description, category, ratePerDay, depositAmount } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Title, description and category are required' });
        }
        if (!Number.isInteger(ratePerDay) || ratePerDay <= 0) {
            return res.status(400).json({ message: 'ratePerDay must be a positive integer (in paise)' });
        }
        if (!Number.isInteger(depositAmount) || depositAmount < 0) {
            return res.status(400).json({ message: 'depositAmount must be a non-negative integer (in paise)' });
        }

        const item = await itemService.createItem(req.user.id, req.body);
        res.status(201).json({ item });
    } catch (err) {
        next(err);
    }
}

async function listMine(req, res, next) {
    try {
        const items = await itemService.getLenderItems(req.user.id);
        res.json({ items });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const item = await itemService.updateItem(req.params.id, req.user.id, req.body);
        res.json({ item });
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        await itemService.deleteItem(req.params.id, req.user.id);
        res.json({ message: 'Listing deleted' });
    } catch (err) {
        next(err);
    }
}

async function uploadPhotos(req, res, next) {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Attach at least one image file' });
        }

        const buffers = req.files.map((f) => f.buffer);
        const item = await itemService.addPhotos(req.params.id, req.user.id, buffers);
        res.json({ item });
    } catch (err) {
        next(err);
    }
}

async function deletePhoto(req, res, next) {
    try {
        const { photoUrl } = req.body;
        if (!photoUrl) {
            return res.status(400).json({ message: 'photoUrl is required' });
        }

        const item = await itemService.removePhoto(req.params.id, req.user.id, photoUrl);
        res.json({ item });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, listMine, update, remove, uploadPhotos, deletePhoto };