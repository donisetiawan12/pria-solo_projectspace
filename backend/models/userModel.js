const db = require('../config/db');

// ambil user by email
const getUserByEmail = (email) => {
  return db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
};

// ambil user by id
const getUserById = (id) => {
  return db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
};

// CREATE USER
const createUser = async (name, email, password, university, bio) => {
  return db.execute(
    'INSERT INTO users (name, email, password, university, bio, role) VALUES (?, ?, ?, ?, ?, "user")',
    [name, email, password, university, bio]
  );
};

// --- TAMBAHAN FITUR FOLLOW & RECOMMENDATIONS ---

// Toggle Follow / Unfollow
const toggleFollowUser = async (followerId, followingId) => {
  const [existing] = await db.execute(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );

  if (existing.length > 0) {
    await db.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return 'Unfollow';
  } else {
    await db.execute(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );
    return 'Follow';
  }
};

// Hitung Mutual Connections (Saling Follow)
const getMutualConnectionsCount = async (userId) => {
  const [rows] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM follows f1 
    INNER JOIN follows f2 
      ON f1.follower_id = f2.following_id 
      AND f1.following_id = f2.follower_id 
    WHERE f1.follower_id = ?
  `, [userId]);
  
  return rows[0].count;
};

// Ambil Rekomendasi User (Untuk Sidebar Kanan)
const getRecommendedUsers = async (currentUserId) => {
  const [users] = await db.execute(`
    SELECT u.id, u.name, u.avatar, u.bio, 
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) as projectCount,
      (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) as isFollowing
    FROM users u 
    WHERE u.id != ?
    ORDER BY RAND() 
    LIMIT 10
  `, [currentUserId, currentUserId]);
  
  return users;
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  toggleFollowUser,
  getMutualConnectionsCount,
  getRecommendedUsers
};