const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploads');
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/projectImageController');

router.post(
  '/:id/images',
  authMiddleware,
  upload.array('images', 5),
  controller.uploadImages
);

module.exports = router;