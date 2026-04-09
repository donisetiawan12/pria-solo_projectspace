const projectModel = require('../models/projectModel');

exports.getAllProjects = (req, res) => {
  projectModel.getAllProjects((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.getProjectById = (req, res) => {
  projectModel.getProjectById(req.params.id, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.createProject = (req, res) => {
  projectModel.createProject(req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Project created', result });
  });
};

exports.updateProject = (req, res) => {
  projectModel.updateProject(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Project updated' });
  });
};

exports.deleteProject = (req, res) => {
  projectModel.deleteProject(req.params.id, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Project deleted' });
  });
};