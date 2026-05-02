const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validasi
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // cek email
    const [existing] = await userModel.getUserByEmail(email);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user
    await userModel.createUser(name, email, hashedPassword);

    res.status(201).json({ message: 'Register berhasil' });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // cek user
    const [user] = await userModel.getUserByEmail(email);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah' });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};