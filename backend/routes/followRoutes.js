const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id', authMiddleware, followController.toggleFollow);
router.get('/:id/followers-count', followController.getFollowersCount);

module.exports = router;