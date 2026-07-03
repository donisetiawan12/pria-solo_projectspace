const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

// Ambil semua daftar bookmark milik user login (Wajib Login)
router.get('/my-bookmarks', authMiddleware, bookmarkController.getMyBookmarks);

// Simpan atau Hapus bookmark berdasarkan ID project (Wajib Login)
router.post('/:id', authMiddleware, bookmarkController.toggleBookmark);

module.exports = router;