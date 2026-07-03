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

// CREATE USER
const createUser = async (name, email, password, university, bio) => {
  return db.execute(
    'INSERT INTO users (name, email, password, university, bio, role) VALUES (?, ?, ?, ?, ?, "user")',
    [name, email, password, university, bio]
  );
};

// 🔥 1. FUNGSI TAMBAH RELASI FOLLOW
const addFollower = async (followerId, followingId) => {
  return db.execute(
    'INSERT INTO followers (follower_id, following_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE follower_id=follower_id', 
    [followerId, followingId]
  );
};

// 🔥 2. FUNGSI MASUKIN DATA NOTIFIKASI
const createNotification = async (data) => {
  return db.execute(
    'INSERT INTO notifications (recipient_id, sender_id, type, project_id) VALUES (?, ?, ?, ?)',
    [data.recipient_id, data.sender_id, data.type, data.project_id]
  );
};

// 🔥 PASTIKAN SEMUA DI-EXPORT DENGAN BENAR DI SINI!
module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  addFollower,        // 👈 Pastikan ini ada
  createNotification  // 👈 INI BIANG KEROKNYA KEMARIN, WAJIB ADA DI SINI!
};