const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// test endpoint
app.get('/', (req, res) => {
  res.send('API ProjectSpace jalan 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running di http://localhost:${PORT}`);
});