const db = require('../config/db');

const getAllProjects = (callback) => {
  db.query('SELECT * FROM projects', callback);
};

const getProjectById = (id, callback) => {
  db.query('SELECT * FROM projects WHERE id = ?', [id], callback);
};

const createProject = (data, callback) => {
  const query = `
    INSERT INTO projects (user_id, title, description, github_link, demo_link)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [
    data.user_id,
    data.title,
    data.description,
    data.github_link,
    data.demo_link
  ], callback);
};

const updateProject = (id, data, callback) => {
  const query = `
    UPDATE projects 
    SET title=?, description=?, github_link=?, demo_link=?
    WHERE id=?
  `;
  db.query(query, [
    data.title,
    data.description,
    data.github_link,
    data.demo_link,
    id
  ], callback);
};

const deleteProject = (id, callback) => {
  db.query('DELETE FROM projects WHERE id = ?', [id], callback);
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};