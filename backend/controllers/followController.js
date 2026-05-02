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