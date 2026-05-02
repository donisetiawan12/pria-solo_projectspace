const db = require('../config/db');

// cek bookmark
exports.checkBookmark = async (userId, projectId) => {
  const [rows] = await db.execute(
    'SELECT * FROM bookmarks WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
  return rows[0];
};

// tambah bookmark
exports.addBookmark = async (userId, projectId) => {
  return db.execute(
    'INSERT INTO bookmarks (user_id, project_id) VALUES (?, ?)',
    [userId, projectId]
  );
};

// hapus bookmark
exports.removeBookmark = async (userId, projectId) => {
  return db.execute(
    'DELETE FROM bookmarks WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
};

// ambil semua bookmark user
exports.getUserBookmarks = async (userId) => {
  const [rows] = await db.execute(`
    SELECT projects.* 
    FROM bookmarks 
    JOIN projects ON bookmarks.project_id = projects.id
    WHERE bookmarks.user_id = ?
    ORDER BY bookmarks.id DESC
  `, [userId]);

  return rows;
};