const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
// 🔄 Panggil seperti biasa, gak perlu pakai kurung kurawal lagi bro!
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploads');

// 🔥 FEED (Gunakan authMiddleware.optionalAuth yang kita tempel tadi)
router.get('/', authMiddleware.optionalAuth, projectController.getAllProjects);

// 🔥 GET DETAIL
router.get('/:id', projectController.getProjectById);

// CREATE (Tetap pake yang wajib login)
router.post('/', authMiddleware, upload.single('image'), projectController.createProject);

// UPDATE
router.put('/:id', authMiddleware, upload.single('image'), projectController.updateProject);

// DELETE
router.delete('/:id', authMiddleware, projectController.deleteProject);

module.exports = router;