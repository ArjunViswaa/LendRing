const browseService = require('../services/browseService');
const { CATEGORIES } = require('../models/Item');

async function browse(req, res, next) {
    try {
        const { category } = req.query;

        if (category && !CATEGORIES.includes(category)) {
            return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
        }

        const result = await browseService.searchItems(req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function detail(req, res, next) {
    try {
        const item = await browseService.getItemDetail(req.params.id);
        res.json({ item });
    } catch (err) {
        next(err);
    }
}

module.exports = { browse, detail };