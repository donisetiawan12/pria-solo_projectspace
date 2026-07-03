const userModel = require('../models/userModel');

exports.getProfile = async (req, res) => {
  const userId = req.params.id;

  const [user] = await userModel.getUserById(userId);
  const [projects] = await userModel.getUserProjects(userId);

  res.json({
    user: user[0],
    projects
  });
};

// --- TAMBAHAN FITUR FOLLOW & RECOMMENDATIONS ---

exports.toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id; 
    const followingId = req.params.id;

    if (followerId == followingId) {
      return res.status(400).json({ success: false, message: "Tidak bisa follow diri sendiri" });
    }

    const action = await userModel.toggleFollowUser(followerId, followingId);
    res.json({ success: true, message: action });
  } catch (error) {
    console.error("Error toggle follow:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getConnectionsCount = async (req, res) => {
  try {
    const userId = req.params.id;
    const count = await userModel.getMutualConnectionsCount(userId);
    
    res.json({ success: true, count: count });
  } catch (error) {
    console.error("Error get connections:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0; 
    const recommendations = await userModel.getRecommendedUsers(currentUserId);
    
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Error get recommendations:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};