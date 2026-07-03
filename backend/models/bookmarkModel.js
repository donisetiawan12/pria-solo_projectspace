const db = require('../config/db');

// cek bookmark
const checkBookmark = async (userId, projectId) => {
  const [rows] = await db.execute(
    'SELECT * FROM bookmarks WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
  return rows[0]; // mengembalikan data kalau ada, atau undefined kalau gak ada
};

// tambah bookmark
const addBookmark = async (userId, projectId) => {
  return db.execute(
    'INSERT INTO bookmarks (user_id, project_id) VALUES (?, ?)',
    [userId, projectId]
  );
};

// hapus bookmark
const removeBookmark = async (userId, projectId) => {
  return db.execute(
    'DELETE FROM bookmarks WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );
};

// ambil semua bookmark user
const getUserBookmarks = async (userId) => {
  const [rows] = await db.execute(`
    SELECT projects.* FROM bookmarks 
    JOIN projects ON bookmarks.project_id = projects.id
    WHERE bookmarks.user_id = ?
    ORDER BY bookmarks.id DESC
  `, [userId]);

  return rows;
};

module.exports = { checkBookmark, addBookmark, removeBookmark, getUserBookmarks };