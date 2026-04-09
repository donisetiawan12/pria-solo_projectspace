const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');

router.get('/', controller.getAllProjects);
router.get('/:id', controller.getProjectById);
router.post('/', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);

module.exports = router;