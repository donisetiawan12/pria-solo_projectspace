const followModel = require('../models/followModel');
const userModel = require('../models/userModel'); 

exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    const [existing] = await followModel.findFollow(userId, targetId);

    if (existing.length > 0) {
      await followModel.unfollow(userId, targetId);
      return res.json({ message: 'Unfollow' });
    }

    await followModel.follow(userId, targetId);

    // 🔥 TRIGGER NOTIFIKASI FOLLOW
    try {
      if (Number(userId) !== Number(targetId)) {
        await userModel.createNotification({
          recipient_id: targetId, 
          sender_id: userId,
          type: 'follow',            
          project_id: null           
        });
        console.log(`✅ Notifikasi FOLLOW berhasil disimpan.`);
      }
    } catch (notifError) {
      console.error("❌ Gagal memproses notif follow:", notifError.message);
    }

    return res.json({ message: 'Follow' });
  } catch (error) {
    console.error("TOGGLE FOLLOW ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getFollowersCount = async (req, res) => {
  try {
    const targetId = req.params.id; 
    const [result] = await followModel.countFollowers(targetId);
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