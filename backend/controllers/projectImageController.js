const projectImageModel = require('../models/projectImageModel');

exports.uploadImages = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Tidak ada file diupload'
      });
    }

    const images = req.files.map(file => file.filename);

    for (let img of images) {
      await projectImageModel.addImage(projectId, img);
    }

    res.json({
      message: 'Upload multiple images berhasil',
      images
    });

  } catch (error) {
    console.error("UPLOAD IMAGE ERROR:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};