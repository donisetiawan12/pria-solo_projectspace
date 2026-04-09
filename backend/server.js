const express = require('express');
const app = express();
require('dotenv').config();

const db = require('./config/db');

app.use(express.json());

// ROUTES
const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/projects', projectRoutes);
app.use('/auth', authRoutes);

// TEST QUERY
db.query('SELECT 1 + 1 AS result', (err, result) => {
  if (err) {
    console.log(err);
  } else {
    console.log('✅ Test Query:', result);
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});