const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploads');

// 🔥 FEED (PUBLIC)
router.get('/', projectController.getAllProjects);

// 🔥 GET DETAIL
// GET DETAIL
router.get('/:id', projectController.getProjectById);

// CREATE
router.post('/', authMiddleware, upload.single('image'), projectController.createProject);

// UPDATE
router.put('/:id', authMiddleware, upload.single('image'), projectController.updateProject);

// DELETE
router.delete('/:id', authMiddleware, projectController.deleteProject);

module.exports = router;