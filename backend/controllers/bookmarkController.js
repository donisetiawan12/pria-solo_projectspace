const bookmarkModel = require('../models/bookmarkModel');
const projectModel = require('../models/projectModel'); 
const userModel = require('../models/userModel');       

// 🔥 1. TOGGLE BOOKMARK (SIMPAN / HAPUS) + NOTIFIKASI
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id; 

    const existing = await bookmarkModel.checkBookmark(userId, projectId);

    if (existing) {
      await bookmarkModel.removeBookmark(userId, projectId);
      return res.json({ message: 'Bookmark dihapus', isBookmarked: false });
    } else {
      await bookmarkModel.addBookmark(userId, projectId);

      // 🔥 TRIGGER NOTIFIKASI BOOKMARK
      try {
        const project = await projectModel.getProjectById(projectId);
        const projectData = Array.isArray(project) ? project[0] : project;

        if (projectData && projectData.user_id) {
          const recipient_id = projectData.user_id;

          // Jangan kirim ke diri sendiri
          if (Number(userId) !== Number(recipient_id)) {
            await userModel.createNotification({
              recipient_id: recipient_id,
              sender_id: userId,
              type: 'bookmark', 
              project_id: projectId
            });
            console.log(`✅ Notifikasi BOOKMARK berhasil disimpan.`);
          }
        }
      } catch (notifError) {
        console.error("❌ Gagal memproses notif bookmark:", notifError.message);
      }

      return res.json({ message: 'Project di-bookmark', isBookmarked: true });
    }

  } catch (error) {
    console.error("BOOKMARK ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 2. AMBIL DAFTAR BOOKMARK SAYA
exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await bookmarkModel.getUserBookmarks(userId);

    const result = data.map(p => ({
      ...p,
      image: p.image ? `http://localhost:3000/uploads/${p.image}` : null
    }));

    res.json({
      message: "Berhasil ambil bookmark user",
      data: result
    });

  } catch (error) {
    console.error("GET BOOKMARK ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};