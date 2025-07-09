const { v4: uuidv4 } = require('uuid');
const blacklist = [];

module.exports = {
  blacklist,
  getNextBlacklistId: () => uuidv4()
};