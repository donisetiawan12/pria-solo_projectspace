const db = require('../config/db');

exports.getAllProjects = async (currentUserId = null) => {
  // 🔥 Query sudah dimodifikasi untuk menghitung Likes, Comments, dan Bookmarks secara realtime
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name,
      users.university as user_nim,  
      users.bio as user_bio,          
      users.avatar as user_avatar,
      IF(follows.follower_id IS NOT NULL, 1, 0) as isFollowing,
      
      -- 🟢 1. Hitung total likes untuk project ini
      (SELECT COUNT(*) FROM likes WHERE likes.project_id = projects.id) as likesCount,
      
      -- 🟢 2. Hitung total comments untuk project ini
      (SELECT COUNT(*) FROM comments WHERE comments.project_id = projects.id) as commentsCount,
      
      -- 🔖 🔥 3. Hitung total berapa banyak user yang menambahkan project ini ke bookmark
      (SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = projects.id) as bookmarksCount,
      
      -- 🟢 4. Cek apakah user yang login saat ini sudah pencet LIKE (1 jika ya, 0 jika tidak)
      IF((SELECT COUNT(*) FROM likes WHERE likes.project_id = projects.id AND likes.user_id = ?) > 0, 1, 0) as isLiked,
      
      -- 🟢 5. Cek apakah user yang login saat ini sudah pencet BOOKMARK (1 jika ya, 0 jika tidak)
      IF((SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = projects.id AND bookmarks.user_id = ?) > 0, 1, 0) as isBookmarked

    FROM projects
    JOIN users ON projects.user_id = users.id
    LEFT JOIN follows ON projects.user_id = follows.following_id AND follows.follower_id = ?
    ORDER BY projects.created_at DESC
  `, [currentUserId, currentUserId, currentUserId]); // 👈 Tetap masukkan currentUserId sebanyak 3 kali sesuai urutan tanda tanya (?)

  return rows;
};

// 🔥 GET PROJECT BY ID
// 🔥 GET PROJECT BY ID (VERSI LENGKAP REALTIME + BOOKMARK COUNT)
exports.getProjectById = async (id, currentUserId = null) => {
  const [rows] = await db.execute(`
    SELECT 
      projects.*, 
      users.name as user_name,
      users.university as user_nim,
      users.bio as user_bio,
      users.avatar as user_avatar,
      IF(follows.follower_id IS NOT NULL, 1, 0) as isFollowing,
      
      -- 🟢 1. Hitung total likes secara realtime
      (SELECT COUNT(*) FROM likes WHERE likes.project_id = projects.id) as likesCount,
      
      -- 🟢 2. Hitung total comments secara realtime
      (SELECT COUNT(*) FROM comments WHERE comments.project_id = projects.id) as commentsCount,
      
      -- 🔖 🔥 3. Hitung total bookmarks secara realtime (BIAR PAS REFRESH GAK ILANG)
      (SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = projects.id) as bookmarksCount,
      
      -- 🟢 4. Cek status like user saat ini
      IF((SELECT COUNT(*) FROM likes WHERE likes.project_id = projects.id AND likes.user_id = ?) > 0, 1, 0) as isLiked,
      
      -- 🟢 5. Cek status bookmark user saat ini
      IF((SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = projects.id AND bookmarks.user_id = ?) > 0, 1, 0) as isBookmarked

    FROM projects
    JOIN users ON projects.user_id = users.id
    LEFT JOIN follows ON projects.user_id = follows.following_id AND follows.follower_id = ?
    WHERE projects.id = ?
  `, [currentUserId, currentUserId, currentUserId, id]); // 👈 Masukkan currentUserId (3x) dan ID Project di paling akhir

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