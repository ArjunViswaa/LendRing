const express = require('express');
const { getMe, updateMe, changePassword } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/password', changePassword);

module.exports = router;