const db = require('../config/db');

const createUser = (data, callback) => {
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [data.name, data.email, data.password],
    callback
  );
};

const getUserByEmail = (email, callback) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], callback);
};

module.exports = {
  createUser,
  getUserByEmail
};