const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Ini sudah otomatis db.promise() dari config lu

// 🔥 IMPORT CONTROLLER BARU KITA DI SINI
const userController = require('../controllers/userController'); 

// 1. KONFIGURASI STORAGE UTK AVATAR & BANNER (DINAMIS)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'banner' ? 'banner-' : 'avatar-';
    cb(null, prefix + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// [PUT] http://localhost:3000/users/profile
// ENDPOINT UPDATE PROFILE
// ==========================================
router.put('/profile', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 } 
]), async (req, res) => {
  try {
    const { id, name, university, bio, about } = req.body; 

    if (!id) {
      return res.status(400).json({ message: "ID User wajib dikirim bro!" });
    }

    let avatarUrl = req.files && req.files['avatar'] ? req.files['avatar'][0].filename : null;
    let bannerUrl = req.files && req.files['banner'] ? req.files['banner'][0].filename : null;

    let query = "UPDATE users SET name = ?, university = ?, bio = ?, about = ?";
    let params = [name, university, bio, about];

    if (avatarUrl) {
      query += ", avatar = ?";
      params.push(avatarUrl);
    }

    if (bannerUrl) {
      query += ", banner = ?";
      params.push(bannerUrl);
    }

    query += " WHERE id = ?";
    params.push(id);

    await db.query(query, params);

    const [rows] = await db.query("SELECT id, name, university, bio, about, avatar, banner FROM users WHERE id = ?", [id]);

    return res.json({
      message: "Profil berhasil diperbarui!",
      user: rows[0]
    });

  } catch (err) {
    console.error("Error di [PUT] /profile:", err);
    return res.status(500).json({ message: "Gagal update database server bro!" });
  }
});

// ==========================================
// 🔥 [GET] ENDPOINT REKOMENDASI SIDEBAR KANAN
// ==========================================
router.get('/recommendations', userController.getRecommendations);

// ==========================================
// 🔥 [POST] ENDPOINT TOGGLE FOLLOW USER
// ==========================================
router.post('/follows/:id', userController.toggleFollow);

// ==========================================
// 🔥 [GET] ENDPOINT MUTUAL CONNECTIONS COUNT
// ==========================================
router.get('/:id/followers-count', userController.getConnectionsCount);

// ==========================================
// 🔥 [GET] ENDPOINT DETAIL PROFIL USER (DINAMIS & AMAN UNTUK SEMUA USER)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Taktik 1: Coba ambil semua kolom lengkap (termasuk nim & email)
    try {
      const [rows] = await db.query(
        "SELECT id, name, university, bio, about, avatar, banner, nim, email FROM users WHERE id = ?", 
        [userId]
      );
      if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan!" });
      return res.json(rows[0]);
    } catch (sqlErr) {
      // Taktik 2: Fallback jika nim/email tidak ada di struktur tabel MySQL
      const [rows] = await db.query(
        "SELECT id, name, university, bio, about, avatar, banner FROM users WHERE id = ?", 
        [userId]
      );
      if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan!" });
      return res.json(rows[0]);
    }

  } catch (err) {
    console.error("Error di [GET] /users/:id:", err);
    return res.status(500).json({ message: "Gagal mengambil data dari database server!" });
  }
});

module.exports = router;