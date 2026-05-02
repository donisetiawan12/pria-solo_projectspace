// const db = require('../config/db');

// const createUser = (name, email, password) => {
//   return db.execute(
//     'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//     [name, email, password]
//   );
// };

// const getUserByEmail = (email) => {
//   return db.execute('SELECT * FROM users WHERE email = ?', [email]);
// };

// module.exports = {
//   createUser,
//   getUserByEmail
// };

const db = require('../config/db');

// ambil user by email
const getUserByEmail = (email) => {
  return db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
};

// ambil user by id
const getUserById = (id) => {
  return db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
};

// create user
const createUser = (name, email, password) => {
  return db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser
};