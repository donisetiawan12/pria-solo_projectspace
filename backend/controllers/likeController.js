const likeModel = require('../models/likeModel');

exports.toggleLike = async (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;

  const [existing] = await likeModel.findLike(userId, projectId);

  if (existing.length > 0) {
    await likeModel.removeLike(userId, projectId);
    return res.json({ message: 'Unlike' });
  }

  await likeModel.addLike(userId, projectId);
  res.json({ message: 'Like' });
};