const userModel = require('../models/userModel');

exports.register = (req, res) => {
  userModel.createUser(req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User registered' });
  });
};

exports.login = (req, res) => {
  userModel.getUserByEmail(req.body.email, (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    if (user.password !== req.body.password) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json({ message: 'Login success', user });
  });
};