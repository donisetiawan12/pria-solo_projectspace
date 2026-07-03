const commentModel = require('../models/commentModel');

// 🔥 1. TAMBAH KOMENTAR
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { comment, parent_id } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Komentar tidak boleh kosong bro bro!' });
    }

    await commentModel.addComment(
      userId,
      projectId,
      comment,
      parent_id || null
    );

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