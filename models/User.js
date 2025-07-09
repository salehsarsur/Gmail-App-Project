const { v4: uuidv4 } = require('uuid');
const users = [];

module.exports = {
  users,
  getNextUserId: () => uuidv4()
};