const express = require('express');
const { browse, detail } = require('../controllers/browseController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', browse);
router.get('/:id', detail);

module.exports = router;