const { blacklist, getNextBlacklistId } = require('../models/Blacklist');
const { sendCommand } = require('../services/BlacklistService');
const { users } = require('../models/User');

module.exports = {
  addToBlacklist: async (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ error: 'User not found.' });

    const { link } = req.body;
    if (!link) return res.status(400).json({ error: 'Link is required' });

    const exists = blacklist.some(item => item.link === link);
    if (exists) return res.status(409).json({ error: 'Link already blacklisted' });

    try {
      const response = await sendCommand(`POST ${link}`);
      if (!response.startsWith('201')) {
        return res.status(400).json({ error: `Bloom server rejected: ${response}` });
      }

      const newItem = {
        id: getNextBlacklistId(),
        link
      };
      blacklist.push(newItem);
      return res.status(201).json(newItem);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to communicate with bloom server' });
    }
  },

  removeFromBlacklist: async (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ error: 'User not found.' });

    const id = req.params.id;
    const index = blacklist.findIndex(item => item.id == id);
    if (index === -1) return res.status(404).json({ error: 'Blacklist item not found' });

    const link = blacklist[index].link;

    try {
      const response = await sendCommand(`DELETE ${link}`);
      if (!response.startsWith('204')) {
        return res.status(400).json({ error: `Bloom server rejected: ${response}` });
      }

      blacklist.splice(index, 1);
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to communicate with bloom server' });
    }
  }
};
