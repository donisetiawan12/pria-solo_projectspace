const followModel = require('../models/followModel');

exports.toggleFollow = async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  const [existing] = await followModel.findFollow(userId, targetId);

  if (existing.length > 0) {
    await followModel.unfollow(userId, targetId);
    return res.json({ message: 'Unfollow' });
  }

  await followModel.follow(userId, targetId);
  res.json({ message: 'Follow' });
};

// Tambahkan ini di controller lu bro!
exports.getFollowersCount = async (req, res) => {
  try {
    const targetId = req.params.id; // Ini ID user yang mau dicek followers-nya (ID lu)
    
    // Panggil model untuk hitung total followers
    // Di sini kita berasumsi ada method countFollowers di model lu
    const [result] = await followModel.countFollowers(targetId);
    
    // result biasanya berupa array object, misal: [{ total: 5 }]
    const count = result[0]?.total || 0;

    res.json({ 
      success: true, 
      count: count 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal hitung followers' });
  }
};