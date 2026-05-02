const db = require('../config/db');

const addComment = (userId, projectId, comment, parentId) => {
  return db.execute(
    'INSERT INTO comments (user_id, project_id, comment, parent_id) VALUES (?, ?, ?, ?)',
    [userId, projectId, comment, parentId]
  );
};

const getComments = (projectId) => {
  return db.execute(
    `SELECT c.*, u.name 
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE project_id = ?`,
    [projectId]
  );
};

module.exports = { addComment, getComments };