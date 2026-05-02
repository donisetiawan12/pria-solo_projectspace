const db = require('../config/db');

const findLike = (userId, projectId) => {
  return db.execute(
    'SELECT * FROM likes WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
};

const addLike = (userId, projectId) => {
  return db.execute(
    'INSERT INTO likes (user_id, project_id) VALUES (?, ?)',
    [userId, projectId]
  );
};

const removeLike = (userId, projectId) => {
  return db.execute(
    'DELETE FROM likes WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
};

module.exports = { findLike, addLike, removeLike };