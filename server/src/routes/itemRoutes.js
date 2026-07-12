const express = require('express');
const { create, listMine, update, remove } = require('../controllers/itemController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('lender'));

router.post('/', create);
router.get('/mine', listMine);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;