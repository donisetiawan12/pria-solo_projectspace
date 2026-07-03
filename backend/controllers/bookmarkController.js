const bookmarkModel = require('../models/bookmarkModel');

// 🔥 1. TOGGLE BOOKMARK (SIMPAN / HAPUS)
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id; // 💡 Ganti jadi .id biar singkron sama route /:id

    const existing = await bookmarkModel.checkBookmark(userId, projectId);

    if (existing) {
      await bookmarkModel.removeBookmark(userId, projectId);
      return res.json({ message: 'Bookmark dihapus', isBookmarked: false });
    } else {
      await bookmarkModel.addBookmark(userId, projectId);
      return res.json({ message: 'Project di-bookmark', isBookmarked: true });
    }

  } catch (error) {
    console.error("BOOKMARK ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔥 2. AMBIL DAFTAR BOOKMARK SAYA (Buat di halaman khusus saved projects)
exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await bookmarkModel.getUserBookmarks(userId);

    // Rapiin static path gambar project biar gak broken image pas di-render
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