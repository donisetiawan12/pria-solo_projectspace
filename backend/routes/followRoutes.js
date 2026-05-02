const express = require('express');
const router = express.Router();

const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id', authMiddleware, followController.toggleFollow);

module.exports = router;