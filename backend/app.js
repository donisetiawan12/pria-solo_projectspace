// =================================================================
// app.js (VERSI FULL FIX + INTEGRASI JALUR NOTIFIKASI)
// =================================================================

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🔥 WAJIB: Buat nyari folder uploads sejajar app.js
require('dotenv').config();

const db = require('./config/db'); // Import koneksi database lu

// 1. INISIALISASI APP
const app = express();

// 2. MIDDLEWARE UTAMA (Wajib ditaruh paling atas sebelum routes)
app.use(express.json());
app.use(cors()); 

// 🔥 3. GERBANG STATIC UPLOADS (Karena folder uploads sejajar app.js)
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// 4. LOGGER MATA-MATA (Buat liat request frontend masuk atau kagak)
app.use((req, res, next) => {
  console.log(`[LOG] Ada Request Masuk: ${req.method} ${req.url}`);
  next();
});

// 5. DEKLARASI & IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const likeRoutes = require('./routes/likeRoutes'); 
const commentRoutes = require('./routes/commentRoutes'); // 🔥 SEKARANG KOMENTAR JALURNYA DIIMPORT DI SINI!
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // 🔥 BARU: Jalur Notifikasi Impor


// 6. PENGGUNAAN ROUTES
app.use('/auth', authRoutes);         
app.use('/projects', projectRoutes);   
app.use('/users', userRoutes); 
app.use('/follows', followRoutes); 
app.use('/likes', likeRoutes); 
app.use('/comments', commentRoutes); // 🔥 SEKARANG JALUR KOMENTAR RESMI DIBUKA DI SINI!
app.use('/bookmarks', bookmarkRoutes); // 🔥 SEKARANG JALUR BOOKMARK RESMI DIBUKA DI SINI!
app.use('/notifications', notificationRoutes); // 🔥 BARU: RESMI DIBUKA DI SINI!

// 7. TEST KONEKSI DATABASE
// =================================================================
db.query('SELECT 1 + 1 AS result')
  .then(([rows]) => {
    console.log('✅ Test Query DB Success, Result:', rows[0].result);
  })
  .catch((err) => {
    console.log('❌ DB Connection Error:', err.message);
  });

// 8. RUNNING SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan mulus di http://localhost:${PORT}`);
});