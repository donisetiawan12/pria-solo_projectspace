const db = require('../config/db');

// Ambil user by email
const getUserByEmail = (email) => {
  return db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
};

// Ambil user by id
const getUserById = (id) => {
  return db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
};

// 🟢 KODE FIX BARU DI userModel.js (Ganti university jadi nim)
const createUser = async (name, email, password, nim, bio) => {
  return db.execute(
    'INSERT INTO users (name, email, password, nim, bio, role) VALUES (?, ?, ?, ?, ?, "user")',
    [name, email, password, nim || '', bio || '']
  );
};

// --- TAMBAHAN FITUR FOLLOW & RECOMMENDATIONS ---

// Toggle Follow / Unfollow
const toggleFollowUser = async (followerId, followingId) => {
  const [existing] = await db.execute(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );

  if (existing.length > 0) {
    await db.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return 'Unfollow';
  } else {
    await db.execute(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );
    return 'Follow';
  }
};

// Hitung Mutual Connections (Saling Follow)
const getMutualConnectionsCount = async (userId) => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM follows f1 
    INNER JOIN follows f2 
      ON f1.follower_id = f2.following_id 
      AND f1.following_id = f2.follower_id 
    WHERE f1.follower_id = ?
  `, [userId]);
  
  return rows[0].count;
};

// Ambil Rekomendasi User (Untuk Sidebar Kanan)
const getRecommendedUsers = async (currentUserId) => {
  const [users] = await db.execute(`
    SELECT u.id, u.name, u.avatar, u.bio, 
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) as projectCount,
      (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) as isFollowing
    FROM users u 
    WHERE u.id != ?
    ORDER BY RAND() 
    LIMIT 10
  `, [currentUserId, currentUserId]);
  
  return users;
};

// 🔥 1. FUNGSI TAMBAH RELASI FOLLOW DARI TEMEN
const addFollower = async (followerId, followingId) => {
  return db.execute(
    'INSERT INTO followers (follower_id, following_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE follower_id=follower_id', 
    [followerId, followingId]
  );
};

// 🔥 2. FUNGSI MASUKIN DATA NOTIFIKASI DARI TEMEN
const createNotification = async (data) => {
  return db.execute(
    'INSERT INTO notifications (recipient_id, sender_id, type, project_id) VALUES (?, ?, ?, ?)',
    [data.recipient_id, data.sender_id, data.type, data.project_id]
  );
};

// 🔥 EXPORT SEMUA FITUR SECARA ADIL & LENGKAP
module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  toggleFollowUser,
  getMutualConnectionsCount,
  getRecommendedUsers,
  addFollower,
  createNotification
};