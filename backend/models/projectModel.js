const db = require('../config/db');

exports.getAllProjects = async (currentUserId = null) => {
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name,
      users.university as user_nim,  
      users.bio as user_bio,          
      users.avatar as user_avatar,
      IF(follows.follower_id IS NOT NULL, 1, 0) as isFollowing
    FROM projects
    JOIN users ON projects.user_id = users.id
    LEFT JOIN follows ON projects.user_id = follows.following_id AND follows.follower_id = ?
    ORDER BY projects.created_at DESC
  `, [currentUserId]); 

  return rows;
};

// 🔥 GET PROJECT BY ID
exports.getProjectById = async (id) => {
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name,
      users.university as user_nim,
      users.bio as user_bio,
      users.avatar as user_avatar
    FROM projects
    JOIN users ON projects.user_id = users.id
    WHERE projects.id = ?
  `, [id]);

  return rows[0];
};

// 🔥 CREATE PROJECT (Sekarang Menyimpan Tech Stack)
exports.createProject = async (data) => {
  const {
    user_id,
    title,
    description,
    image,
    github_link,
    demo_link,
    tags,
    is_free,
    tech_stack // 🔥 TANGKAP DATA TECH STACK
  } = data;

  const [result] = await db.execute(
    `INSERT INTO projects 
    (user_id, title, description, image, github_link, demo_link, tags, is_free, tech_stack)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, // 🔥 Tambah slot (?) baru untuk tech_stack
    [
      user_id,
      title,
      description || null,
      image || null,
      github_link || null,
      demo_link || null,
      tags || null,
      is_free ?? 1,
      tech_stack || null // 🔥 MASUKIN KE PARAMETER QUERY
    ]
  );

  return result;
};

// 🔥 UPDATE PROJECT (Sekarang Bisa Edit Tech Stack)
exports.updateProject = async (
  id,
  title,
  description,
  image,
  github_link,
  demo_link,
  tags,
  is_free,
  tech_stack // 🔥 TANGKAP TECH STACK DI PARAMETER FITUR EDIT
) => {
  return db.execute(
    `UPDATE projects 
     SET title=?, description=?, image=COALESCE(?, image), github_link=?, demo_link=?, tags=?, is_free=?, tech_stack=? 
     WHERE id=?`, // 🔥 Tambah update field tech_stack=? sebelum WHERE id=?
    [
      title, 
      description, 
      image, 
      github_link, 
      demo_link, 
      tags, 
      is_free, 
      tech_stack || null, // 🔥 MASUKIN SEBAGAI PARAMETER SEBELUM ID
      id
    ]
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