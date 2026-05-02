const express = require('express');
const router = express.Router();

const controller = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

// toggle bookmark
router.post('/:project_id', authMiddleware, controller.toggleBookmark);

// get semua bookmark user
router.get('/me', authMiddleware, controller.getMyBookmarks);

module.exports = router;