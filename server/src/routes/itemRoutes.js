const express = require('express');
const { create, listMine, update, remove, uploadPhotos, deletePhoto } = require('../controllers/itemController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireRole('lender'));

router.post('/', create);
router.get('/mine', listMine);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/photos', upload.array('photos', 5), uploadPhotos);
router.delete('/:id/photos', deletePhoto);

module.exports = router;