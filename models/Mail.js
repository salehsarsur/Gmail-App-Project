const { v4: uuidv4 } = require('uuid');

const mails = [];

module.exports = {
  mails,
  getNextMailId: () => uuidv4(),

  initializeMailBase: (from, to, subject, body, label = null) => ({
    id: uuidv4(),
    from,
    to,
    subject,
    body,
    date: new Date().toISOString(),
    isRead: false,
    label,
    labels: [] 
  })
};
