const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const authMiddleware = require('../middleware/authMiddleware'); // 🔥 Pakai middleware asli lu

// 🔔 1. GET ALL MY NOTIFICATIONS
router.get('/my-notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 

    const query = `
      SELECT n.*, 
             IFNULL(u.name, 'Seseorang') AS sender_name, 
             u.avatar AS sender_avatar, 
             p.title AS project_title
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      LEFT JOIN projects p ON n.project_id = p.id
      WHERE n.recipient_id = ?
      ORDER BY n.created_at DESC LIMIT 20
    `;
    
    const [rows] = await db.execute(query, [userId]);
    console.log(`[NOTIF] ✅ User ID ${userId} sukses fetch data. Ditemukan: ${rows.length} notifikasi.`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("ROUTE GET NOTIF ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔔 2. MARK AS READ
router.put('/mark-as-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.execute('UPDATE notifications SET is_read = 1 WHERE recipient_id = ?', [userId]);
    res.json({ success: true, message: 'Semua notifikasi telah dibaca' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;