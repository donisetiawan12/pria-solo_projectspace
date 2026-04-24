const db = require('../config/db');

const createProject = (title, description, user_id) => {
  return db.execute(
    'INSERT INTO projects (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, user_id]
  );
};

const getAllProjects = () => {
  return db.execute('SELECT * FROM projects');
};

const getProjectById = (id) => {
  return db.execute('SELECT * FROM projects WHERE id = ?', [id]);
};

const updateProject = (id, title, description) => {
  return db.execute(
    'UPDATE projects SET title = ?, description = ? WHERE id = ?',
    [title, description, id]
  );
};

const deleteProject = (id) => {
  return db.execute('DELETE FROM projects WHERE id = ?', [id]);
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};