const db = require('../config/db');

const addImage = (project_id, image) => {
  return db.execute(
    'INSERT INTO project_images (project_id, image) VALUES (?, ?)',
    [project_id, image]
  );
};

module.exports = { addImage };