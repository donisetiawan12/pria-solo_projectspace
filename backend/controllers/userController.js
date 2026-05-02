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