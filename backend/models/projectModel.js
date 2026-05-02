const db = require('../config/db');

// 🔥 GET ALL PROJECTS
exports.getAllProjects = async () => {
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name 
    FROM projects
    JOIN users ON projects.user_id = users.id
    ORDER BY projects.created_at DESC
  `);

  return rows;
};

// 🔥 GET PROJECT BY ID
exports.getProjectById = async (id) => {
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name 
    FROM projects
    JOIN users ON projects.user_id = users.id
    WHERE projects.id = ?
  `, [id]);

  return rows[0];
};

// 🔥 CREATE PROJECT
exports.createProject = async (data) => {
  const {
    user_id,
    title,
    description,
    image,
    github_link,
    demo_link,
    tags,
    is_free
  } = data;

  const [result] = await db.execute(
    `INSERT INTO projects 
    (user_id, title, description, image, github_link, demo_link, tags, is_free)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      title,
      description || null,
      image || null,
      github_link || null,
      demo_link || null,
      tags || null,
      is_free ?? 1
    ]
  );

  return result;
};

// 🔥 UPDATE PROJECT
exports.updateProject = async (
  id,
  title,
  description,
  image,
  github_link,
  demo_link,
  tags,
  is_free
) => {
  return db.execute(
    `UPDATE projects 
     SET title=?, description=?, image=COALESCE(?, image), github_link=?, demo_link=?, tags=?, is_free=? 
     WHERE id=?`,
    [title, description, image, github_link, demo_link, tags, is_free, id]
  );
};

// 🔥 DELETE PROJECT
exports.deleteProject = async (id) => {
  const [result] = await db.execute(
    `DELETE FROM projects WHERE id=?`,
    [id]
  );

  return result;
};