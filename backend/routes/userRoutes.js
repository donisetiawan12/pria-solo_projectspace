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
// ENDPOINT UPDATE PROFILE (ANTI-NULL & ANTI-TIMPA DATA LAMA)
// ==========================================
router.put('/profile', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 } 
]), async (req, res) => {
  try {
    const { id, name, nim, bio, about } = req.body; 

    if (!id) {
      return res.status(400).json({ message: "ID User wajib dikirim bro!" });
    }

    let avatarUrl = req.files && req.files['avatar'] ? req.files['avatar'][0].filename : null;
    let bannerUrl = req.files && req.files['banner'] ? req.files['banner'][0].filename : null;

    // 🎯 KUNCI UTAMA: Pakai COALESCE(?, kolom) biar kalau nilainya kosong/undefined, dia pakai nilai lama di DB
    let query = "UPDATE users SET name = COALESCE(?, name), nim = COALESCE(?, nim), bio = COALESCE(?, bio), about = COALESCE(?, about)";
    let params = [
      name || null, 
      (nim !== undefined && nim !== '') ? nim : null, 
      bio || null, 
      about || null
    ];

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

    // Jalankan eksekusi update ke database
    await db.query(query, params);

    // Ambil data segar dari DB setelah update
    const [rows] = await db.query(
      "SELECT id, name, nim, bio, about, avatar, banner, email FROM users WHERE id = ?", 
      [id]
    );

    return res.json({
      message: "Profil berhasil diperbarui!",
      user: rows[0]
    });

  } catch (err) {
    console.error("Error di [PUT] /profile:", err);
    return res.status(500).json({ message: "Gagal update database server bro!" });
  }
});


module.exports = router;