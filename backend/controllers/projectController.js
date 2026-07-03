const projectModel = require('../models/projectModel');
const { getGithubZip } = require('../utils/github');

// 🔥 1. GET ALL PROJECTS (REALTIME COUNTERS)
exports.getAllProjects = async (req, res) => {
  try {
    const currentUserId = req.user?.id || null; 
    const projects = await projectModel.getAllProjects(currentUserId);

    const result = projects.map(p => ({
      id: p.id,
      user_id: p.user_id, 
      title: p.title,
      description: p.description,
      image: p.image ? `http://localhost:3000/uploads/${p.image}` : null,
      github_link: p.github_link,
      demo_link: p.demo_link,
      tags: p.tags,
      is_free: p.is_free,
      tech_stack: p.tech_stack, 
      created_at: p.created_at,
      download_url: p.github_link ? getGithubZip(p.github_link) : null,
      isFollowing: p.isFollowing === 1 ? 1 : 0,
      isMe: currentUserId && Number(p.user_id) === Number(currentUserId) ? true : false,
      
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      bookmarksCount: p.bookmarksCount || 0, // 🔥 Pastikan nampil di homepage
      isLiked: p.isLiked === 1 ? true : false,
      isBookmarked: p.isBookmarked === 1 ? true : false,
      
      author: {
        name: p.user_name || 'Anonymous',
        nim: p.user_nim || '00000000',                     
        bio: p.user_bio || 'Software Engineering Student', 
        avatar: p.user_avatar ? `http://localhost:3000/uploads/${p.user_avatar}` : null 
      }
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

// 🔥 2. GET BY ID (SINKRON DATA REALTIME PAS DI-REFRESH)
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const currentUserId = req.user?.id || null; // 🔑 AMBIL ID USER DARI TOKEN LOGIN

    // 🔄 OPER currentUserId KE MODEL BIAR DIHITUNG DI MYSQL
    const project = await projectModel.getProjectById(projectId, currentUserId);

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    // ⚙️ Rapiin data format balikan biar struktur key-nya sama kayak getAllProjects
    const result = {
      ...project,
      image: project.image ? `http://localhost:3000/uploads/${project.image}` : null,
      download_url: project.github_link ? getGithubZip(project.github_link) : null,
      isLiked: project.isLiked === 1 ? true : false,
      isBookmarked: project.isBookmarked === 1 ? true : false,
      isFollowing: project.isFollowing === 1 ? 1 : 0,
      isMe: currentUserId && Number(project.user_id) === Number(currentUserId) ? true : false,
      likesCount: project.likesCount || 0,
      commentsCount: project.commentsCount || 0,
      bookmarksCount: project.bookmarksCount || 0, // 🔖 AMAN! DATA TETAP DI LOCK PAS DI REFRESH
      author: {
        name: project.user_name || 'Anonymous',
        nim: project.user_nim || '00000000',
        bio: project.user_bio || 'Software Engineering Student',
        avatar: project.user_avatar ? `http://localhost:3000/uploads/${project.user_avatar}` : null
      }
    };

    res.json(result);

  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 3. CREATE PROJECT 
exports.createProject = async (req, res) => {
  try {
    const user_id = req.user?.id || req.body.user_id;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID tidak terdeteksi, lu harus login bro!' });
    }

    let {
      title,
      description,
      github_link,
      demo_link,
      tags,
      is_free,
      tech_stack 
    } = req.body;

    description = description || null;
    github_link = github_link || null;
    demo_link = demo_link || null;
    tags = tags || null;
    is_free = is_free ?? 1;
    tech_stack = tech_stack || null; 

    const image = req.file ? req.file.filename : null;

    const project = await projectModel.createProject({
      user_id,
      title,
      description,
      image,
      github_link,
      demo_link,
      tags,
      is_free,
      tech_stack 
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

// 🔥 4. UPDATE PROJECT
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
      is_free,
      tech_stack
    } = req.body;

    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    title = title || null;
    description = description || null;
    github_link = github_link || null;
    demo_link = demo_link || null;
    tags = tags || null;
    is_free = is_free ?? 1;
    tech_stack = tech_stack || null; 

    // Ambil data untuk validasi kepemilikan
    const project = await projectModel.getProjectById(projectId, userId);

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
      is_free,
      tech_stack
    );

    res.json({
      message: 'Project berhasil diupdate'
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 5. DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await projectModel.getProjectById(projectId, userId);

    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

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