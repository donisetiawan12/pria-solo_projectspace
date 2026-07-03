const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware'); // 🔥 Fix path asli

// Ambil semua daftar bookmark milik user login
router.get('/my-bookmarks', authMiddleware, bookmarkController.getMyBookmarks);

// Simpan atau Hapus bookmark berdasarkan ID project
router.post('/:id', authMiddleware, bookmarkController.toggleBookmark);

module.exports = router;