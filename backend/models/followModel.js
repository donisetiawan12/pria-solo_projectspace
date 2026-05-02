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

module.exports = { findFollow, follow, unfollow };