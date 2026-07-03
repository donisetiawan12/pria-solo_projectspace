const likeModel = require('../models/likeModel');
const userModel = require('../models/userModel');
const projectModel = require('../models/projectModel'); // 🔥 Kita pakai model asli project lu

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // 1. Cek apakah user sudah pernah like
    const [existing] = await likeModel.findLike(userId, projectId);

    if (existing.length > 0) {
      await likeModel.removeLike(userId, projectId);
      return res.json({ message: 'Unlike' });
    }

    // 2. Jalankan proses LIKE bawaan lu
    await likeModel.addLike(userId, projectId);

    // 3. 🔥 PROSES AMBIL DATA PROJECT BIAR GAK EROR 500
    // Kita gunakan try-catch kecil khusus notif agar jika nyangkut, proses LIKE-nya tetap berhasil
    try {
      // Ambil data project untuk cari tahu recipient_id (pemilik project)
      const project = await projectModel.getProjectById(projectId);
      
      // Jika projectModel.getProjectById mengembalikan array, kita ambil indeks ke-0
      const projectData = Array.isArray(project) ? project[0] : project;

      if (projectData && projectData.user_id) {
        const recipient_id = projectData.user_id;

        // Jangan kirim notifikasi ke diri sendiri
        if (Number(userId) !== Number(recipient_id)) {
          await userModel.createNotification({
            recipient_id: recipient_id,
            sender_id: userId,
            type: 'like',
            project_id: projectId
          });
          console.log(`✅ Notifikasi LIKE dari user ${userId} ke user ${recipient_id} berhasil disimpan ke DB.`);
        }
      } else {
        console.log("⚠️ Pemilik project tidak ditemukan atau struktur data project berbeda.");
      }
    } catch (notifError) {
      // Jika sistem notifikasi gagal, log erornya tapi jangan bikin route /likes/6 lu jadi eror 500
      console.error("❌ Gagal memproses trigger notifikasi:", notifError.message);
    }

    return res.json({ message: 'Like' });
  } catch (error) {
    console.error("TOGGLE LIKE ERROR UTAMA:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};