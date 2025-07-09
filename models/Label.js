const { v4: uuidv4 } = require('uuid');
const labels = [];

module.exports = {
  labels,
  getNextLabelId: () => uuidv4()
};