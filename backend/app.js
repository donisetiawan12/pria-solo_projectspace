require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes'); // 🔥 TAMBAH INI

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); // 🔥 TAMBAH INI

// test route
app.get('/', (req, res) => {
  res.send('API ProjectSpace jalan 🚀');
});

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running di http://localhost:${PORT}`);
});