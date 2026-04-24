const jwt = require('jsonwebtoken');
require('dotenv').config(); // 🔥 pastikan env kebaca

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('HEADER:', authHeader);

  // ❌ kalau header ga ada
  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ada' });
  }

  // ❌ cek format harus "Bearer TOKEN"
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Format token salah' });
  }

  const token = authHeader.split(' ')[1];

  console.log('TOKEN:', token);
  console.log('SECRET:', process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('DECODED:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT ERROR:', err.message);

    return res.status(403).json({
      message: 'Token tidak valid',
      error: err.message // 🔥 biar keliatan penyebabnya
    });
  }
};

module.exports = authMiddleware;