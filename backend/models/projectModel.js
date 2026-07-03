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

// 🔥 CREATE PROJECT (SUDAH DI-RESTORE: Menambah kolom tech_stack)
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
    tech_stack // 🟢 KITA BALIKIN KE SINI BRO
  } = data;

  // 🟢 Tambah tech_stack di query dan slot tanda tanya (?) jadi 9
  const [result] = await db.execute(
    `INSERT INTO projects 
    (user_id, title, description, image, github_link, demo_link, tags, is_free, tech_stack)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      user_id,
      title,
      description || null,
      image || null,
      github_link || null,
      demo_link || null,
      tags || null,
      is_free ?? 1,
      tech_stack || null // 🟢 Masukkan nilainya ke array query
    ]
  );

  return result;
};

// 🔥 UPDATE PROJECT (SUDAH DI-RESTORE: Mengupdate kolom tech_stack)
exports.updateProject = async (
  id,
  title,
  description,
  image,
  github_link,
  demo_link,
  tags,
  is_free,
  tech_stack // 🟢 KITA TAMBAHKAN PARAMETERNYA DI SINI
) => {
  return db.execute(
    `UPDATE projects 
     SET title=?, description=?, image=COALESCE(?, image), github_link=?, demo_link=?, tags=?, is_free=?, tech_stack=? 
     WHERE id=?`, // 🟢 Selipkan tech_stack=? sebelum WHERE id=?
    [
      title, 
      description, 
      image, 
      github_link, 
      demo_link, 
      tags, 
      is_free, 
      tech_stack, // 🟢 Taruh tech_stack di sini sebelum id
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