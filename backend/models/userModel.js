const db = require('../config/db');

const createUser = (name, email, password) => {
  return db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
};

const getUserByEmail = (email) => {
  return db.execute('SELECT * FROM users WHERE email = ?', [email]);
};

module.exports = {
  createUser,
  getUserByEmail
};