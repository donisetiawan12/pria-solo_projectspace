const db = require('../config/db');

const addComment = (userId, projectId, comment, parentId) => {
  return db.execute(
    'INSERT INTO comments (user_id, project_id, comment, parent_id) VALUES (?, ?, ?, ?)',
    [userId, projectId, comment, parentId]
  );
};

const getComments = (projectId) => {
  return db.execute(
    `SELECT c.*, u.name as user_name, u.avatar as user_avatar 
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.project_id = ?
     ORDER BY c.created_at ASC`,
    [projectId]
  );
};

// 🔥 TAMBAHKAN FUNGSI HAPUS INI BRO
const deleteComment = (commentId, userId) => {
  return db.execute(
    'DELETE FROM comments WHERE id = ? AND user_id = ?',
    [commentId, userId]
  );
};

// Pastikan didaftarkan di sini biar bisa diimport di controller
module.exports = { addComment, getComments, deleteComment };