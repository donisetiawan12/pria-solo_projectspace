const projectModel = require('../models/projectModel');

// CREATE (kalau udah ada, biarin)
exports.createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    await projectModel.createProject(userId, title, description);

    res.status(201).json({ message: 'Project berhasil dibuat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// UPDATE (ownership)
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { title, description } = req.body;

    const [rows] = await projectModel.getProjectById(projectId);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    const project = rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({ message: 'Bukan project kamu' });
    }

    await projectModel.updateProject(projectId, title, description);

    res.json({ message: 'Project berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE (punya lu)
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [rows] = await projectModel.getProjectById(projectId);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    const project = rows[0];

    if (project.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await projectModel.deleteProject(projectId);

    res.json({ message: 'Project berhasil dihapus' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};