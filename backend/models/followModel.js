const db = require('../config/db');

const findFollow = (userId, targetId) => {
  return db.execute(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [userId, targetId]
  );
};

const follow = (userId, targetId) => {
  return db.execute(
    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
    [userId, targetId]
  );
};

const unfollow = (userId, targetId) => {
  return db.execute(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [userId, targetId]
  );
};

// 🔥 TAMBAHIN FUNGSI INI BRO BUAT NGITUNG FOLLOWERS
const countFollowers = (targetId) => {
  return db.execute(
    'SELECT COUNT(*) as total FROM follows WHERE following_id = ?',
    [targetId]
  );
};

// 🔥 JANGAN LUPA MASUKIN `countFollowers` DI SINI BIAR BISA DI-REQUIRE CONTROLLER
module.exports = { findFollow, follow, unfollow, countFollowers };