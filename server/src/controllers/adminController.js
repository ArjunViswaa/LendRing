const adminService = require('../services/adminService');

async function users(req, res, next) {
    try {
        res.json(await adminService.listUsers(req.query));
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        res.json({ user: await adminService.setUserFlags(req.params.id, req.body) });
    } catch (err) {
        next(err);
    }
}

async function items(req, res, next) {
    try {
        res.json(await adminService.listItems(req.query));
    } catch (err) {
        next(err);
    }
}

async function updateItem(req, res, next) {
    try {
        res.json({ item: await adminService.setItemStatus(req.params.id, req.body.status) });
    } catch (err) {
        next(err);
    }
}

module.exports = { users, updateUser, items, updateItem };