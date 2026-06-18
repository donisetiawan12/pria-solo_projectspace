const express = require('express');
const router = express.Router();

const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

// Rute yang sudah ada
router.post('/:id', authMiddleware, followController.toggleFollow);

// 🔥 TAMBAHKAN RUTE GET INI BRO!
router.get('/:id/followers-count', followController.getFollowersCount);

module.exports = router;