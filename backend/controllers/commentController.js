const commentModel = require('../models/commentModel');

exports.addComment = async (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  const { comment, parent_id } = req.body;

  await commentModel.addComment(
    userId,
    projectId,
    comment,
    parent_id || null
  );

  res.json({ message: 'Comment added' });
};

exports.getComments = async (req, res) => {
  const projectId = req.params.id;

  const [comments] = await commentModel.getComments(projectId);

  res.json(comments);
};