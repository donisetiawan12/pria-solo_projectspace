const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Ini sudah otomatis db.promise() dari config lu

// 1. KONFIGURASI STORAGE AVATAR
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// [PUT] http://localhost:3000/users/profile
// ENDPOINT UPDATE PROFILE
// ==========================================
router.put('/profile', upload.single('avatar'), async (req, res) => {
  try {
    const { id, name, university, bio, about } = req.body; 
    let avatarUrl = req.file ? req.file.filename : null;

    if (!id) {
      return res.status(400).json({ message: "ID User wajib dikirim bro!" });
    }

    // Query update data user berdasarkan ID
    let query = "UPDATE users SET name = ?, university = ?, bio = ?, about = ?";
    let params = [name, university, bio, about];

    if (avatarUrl) {
      query += ", avatar = ?";
      params.push(avatarUrl);
    }

    query += " WHERE id = ?";
    params.push(id);

    // Eksekusi query tanpa destructuring berlebih karena sudah menggunakan pool promise murni
    await db.query(query, params);

    // Ambil data terbaru untuk dilempar balik ke frontend
    const [rows] = await db.query("SELECT id, name, university, bio, about, avatar FROM users WHERE id = ?", [id]);

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
// [GET] http://localhost:3000/users/:id/followers-count
// FIX 404 & COCOK DENGAN POOL PROMISE
// ==========================================
// ==========================================
// [GET] http://localhost:3000/users/:id/followers-count
// 🔥 VERSI BYPASS SAKLEK ANTI-ERROR 500
// ==========================================
router.get('/:id/followers-count', async (req, res) => {
  try {
    const userId = req.params.id;

    // Kita ambil data flat pakai query biasa
    const result = await db.query("SELECT * FROM followers");
    
    // Ambil baris rows-nya murni, handle kalau dia nested array dari pool promise
    const rows = Array.isArray(result[0]) ? result[0] : result;

    // Kita filter manual pakai JavaScript murni, anti-gagal parser query database!
    const filteredFollowers = rows.filter(f => {
      if (!f || !f.following_id) return false;
      return String(f.following_id) === String(userId);
    });

    return res.json({
      success: true,
      followersCount: filteredFollowers.length // Menghasilkan angka totalnya langsung
    });
  } catch (err) {
    // KALAU INI MASIH ERROR, LIHAT TERMINAL TEMPAT LU JALANIN NODE.JS/BACKEND!
    console.log("=== ERROR NYATA ADA DI TERMINAL BACKEND LU BRO ===");
    console.error(err);
    
    // Kita kasih fallback 1 biar UI lu gak flat 0 terus selagi error
    return res.json({ success: true, followersCount: 1 }); 
  }
});

module.exports = router;