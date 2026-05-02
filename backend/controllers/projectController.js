const projectModel = require('../models/projectModel');
const { getGithubZip } = require('../utils/github');

// 🔥 GET ALL PROJECTS (FEED)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjects();

    const result = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image ? `http://localhost:3000/uploads/${p.image}` : null,
      github_link: p.github_link,
      demo_link: p.demo_link,
      tags: p.tags,
      is_free: p.is_free,
      created_at: p.created_at,
      download_url: p.github_link ? getGithubZip(p.github_link) : null
    }));

    res.json({
      message: "Berhasil ambil semua project",
      total: result.length,
      data: result
    });

  } catch (error) {
    console.error("GET PROJECT ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 GET BY ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await projectModel.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    project.download_url = project.github_link
      ? getGithubZip(project.github_link)
      : null;

    res.json(project);

  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const user_id = req.user.id;

    let {
      title,
      description,
      github_link,
      demo_link,
      tags,
      is_free
    } = req.body;

    // 🔥 HANDLE UNDEFINED
    description = description || null;
    github_link = github_link || null;
    demo_link = demo_link || null;
    tags = tags || null;
    is_free = is_free ?? 1;

    const image = req.file ? req.file.filename : null;

    const project = await projectModel.createProject({
      user_id,
      title,
      description,
      image,
      github_link,
      demo_link,
      tags,
      is_free
    });

    res.json({
      message: "Project berhasil dibuat",
      data: project
    });

  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    let {
      title,
      description,
      github_link,
      demo_link,
      tags,
      is_free
    } = req.body;

    // 🔥 HANDLE IMAGE
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    // 🔥 UBah undefined jadi null
    title = title || null;
    description = description || null;
    github_link = github_link || null;
    demo_link = demo_link || null;
    tags = tags || null;
    is_free = is_free ?? 1;

    // 🔥 CHECK OWNER
    const project = await projectModel.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ message: 'Bukan punya lu bro 😄' });
    }

    await projectModel.updateProject(
      projectId,
      title,
      description,
      image,
      github_link,
      demo_link,
      tags,
      is_free
    );

    res.json({
      message: 'Project berhasil diupdate'
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await projectModel.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    // 🔥 VALIDASI OWNER
    if (project.user_id !== userId) {
      return res.status(403).json({
        message: 'Lu bukan pemilik project ini'
      });
    }

    await projectModel.deleteProject(projectId);

    res.json({ message: 'Project berhasil dihapus' });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};