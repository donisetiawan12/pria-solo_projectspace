const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==================== FUNGSI REGISTER ====================
const register = async (req, res) => {
  try {
    // 1. Tangkap variabel Sesuai yang dikirim dari Form Register Lu
    // 'identity' itu buat NIM, 'bio' itu buat Headline Kompetensi
    const { name, email, identity, bio, password } = req.body;

    // validasi field wajib
    if (!name || !email || !identity || !bio || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // cek email apakah sudah terdaftar
    const [existing] = await userModel.getUserByEmail(email);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. SIMPAN USER KE DB
    // 🎯 FIX: identity (NIM) dilempar ke parameter ke-4 yang sekarang di userModel diterima sebagai 'nim'
    await userModel.createUser(name, email, hashedPassword, identity, bio);

    return res.status(201).json({ message: 'Register berhasil' });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ==================== FUNGSI LOGIN ====================
const login = async (req, res) => {
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
      { id: user[0].id, role: user[0].role },
      process.env.JWT_SECRET || 'SECRET_CADANGAN_123',
      { expiresIn: '1d' }
    );

    // 3. Kirim data user lengkap ke frontend biar localStorage langsung dapet data asli
    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        nim: user[0].nim || user[0].university, // 🎯 FIX: Kirim sebagai key 'nim' agar terbaca pas login awal di frontend!
        bio: user[0].bio,                      // Ini isinya Headline Kompetensi lu
        avatar: user[0].avatar,
        role: user[0].role
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// EXPORT DENGAN CARA MODERN DAN AMAN UNTUK EXPRESS ROUTER
module.exports = {
  register,
  login
};