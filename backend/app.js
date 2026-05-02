require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const userRoutes = require('./routes/userRoutes');
const projectImageRoutes = require('./routes/projectImageRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectImageRoutes);
app.use('/api/bookmarks', bookmarkRoutes);


// static upload
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('API ProjectSpace jalan 🚀');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running di http://localhost:${PORT}`);
});