const commentModel = require('../models/commentModel');
const projectModel = require('../models/projectModel'); // 🔥 Butuh ini buat nyari owner project
const userModel = require('../models/userModel');       // 🔥 Butuh ini buat kirim notif

// 🔥 1. TAMBAH KOMENTAR + NOTIFIKASI
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { comment, parent_id } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Komentar tidak boleh kosong bro bro!' });
    }

    // A. Jalankan proses simpan komentar bawaan lu
    await commentModel.addComment(
      userId,
      projectId,
      comment,
      parent_id || null
    );

    // B. 🔥 TRIGGER NOTIFIKASI KOMENTAR
    try {
      // Cari pemilik project berdasarkan ID project
      const project = await projectModel.getProjectById(projectId);
      const projectData = Array.isArray(project) ? project[0] : project;

      if (projectData && projectData.user_id) {
        const recipient_id = projectData.user_id;

        // Proteksi: Jangan kirim notif ke diri sendiri kalau komen di project sendiri
        if (Number(userId) !== Number(recipient_id)) {
          await userModel.createNotification({
            recipient_id: recipient_id,
            sender_id: userId,
            type: 'comment', // 👈 Tipe datanya: comment
            project_id: projectId
          });
          console.log(`✅ Notifikasi KOMENTAR dari user ${userId} berhasil disimpan.`);
        }
      }
    } catch (notifError) {
      // Log kalau sistem notif error, tapi route tetep ngasih response sukses ke user
      console.error("❌ Gagal memproses notif komentar:", notifError.message);
    }

    res.json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 2. AMBIL SEMUA KOMENTAR BERDASARKAN PROJECT ID
exports.getComments = async (req, res) => {
  try {
    const projectId = req.params.id;
    const [comments] = await commentModel.getComments(projectId);

    // Rapiin path url avatar user yang ngasih komen biar gak broken image di frontend
    const result = comments.map(c => ({
      ...c,
      user_avatar: c.user_avatar ? `http://localhost:3000/uploads/${c.user_avatar}` : null
    }));

    res.json({
      message: "Berhasil ambil komentar",
      data: result
    });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};