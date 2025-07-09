const { labels, getNextLabelId } = require('../models/Label');
const { users } = require('../models/User');

module.exports = {
  createLabel: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newLabel = {
      id: getNextLabelId(),
      name,
    };
    labels.push(newLabel);
    return res.status(201).json(newLabel);
  },

  getLabelsByUser: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(labels);
  },

  getLabelsById: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const label = labels.find(l => l.id == id);
    if (!label) return res.status(404).json({ error: 'Label not found' });
    res.json(label);
  },

  updateLabel: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const labelIndex = labels.findIndex(l => l.id == id);
    if (labelIndex === -1) return res.status(404).json({ error: 'Label not found' });

    const label = labels[labelIndex];
    labels[labelIndex] = { ...label, ...req.body };
    res.json(labels[labelIndex]);
  },

  deleteLabel: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const labelIndex = labels.findIndex(l => l.id == id);
    if (labelIndex === -1) return res.status(404).json({ error: 'Label not found' });

    labels.splice(labelIndex, 1);
    res.status(204).end();
  },
};
