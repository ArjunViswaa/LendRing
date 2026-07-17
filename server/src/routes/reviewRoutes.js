const express = require('express');
const { create, forUser, given } = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', create);
router.get('/given', given);
router.get('/user/:id', forUser);

module.exports = router;