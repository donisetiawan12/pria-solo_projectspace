const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id', authMiddleware, commentController.addComment);
router.get('/:id', commentController.getComments);

module.exports = router;