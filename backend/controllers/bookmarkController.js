const bookmarkModel = require('../models/bookmarkModel');

exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.project_id;

    const existing = await bookmarkModel.checkBookmark(userId, projectId);

    if (existing) {
      await bookmarkModel.removeBookmark(userId, projectId);
      return res.json({ message: 'Bookmark dihapus' });
    } else {
      await bookmarkModel.addBookmark(userId, projectId);
      return res.json({ message: 'Project di-bookmark' });
    }

  } catch (error) {
    console.error("BOOKMARK ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await bookmarkModel.getUserBookmarks(userId);

    res.json(data);

  } catch (error) {
    console.error("GET BOOKMARK ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};