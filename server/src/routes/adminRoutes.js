const express = require('express');
const { users, updateUser, items, updateItem } = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', users);
router.put('/users/:id', updateUser);
router.get('/items', items);
router.put('/items/:id', updateItem);

module.exports = router;