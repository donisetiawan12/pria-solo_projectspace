const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔥 validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // 🔥 cek email sudah ada
    const [rows] = await userModel.getUserByEmail(email);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // 🔥 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 simpan user (default role = user)
    await userModel.createUser(name, email, hashedPassword, 'user');

    res.status(201).json({ message: 'Register berhasil' });

  } catch (error) {
    console.error('REGISTER ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 validasi biar ga undefined
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // 🔥 ambil user
    const [rows] = await userModel.getUserByEmail(email);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    const user = rows[0];

    // 🔥 cek password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah' });
    }

    // 🔥 generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role || 'user' }, // fallback biar aman
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};