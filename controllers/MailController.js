const { mails, getNextMailId } = require('../models/Mail');
const { blacklist } = require('../models/Blacklist');
const { users } = require('../models/User');
const path = require('path');

module.exports = {
  createMail: (req, res) => {
    const userId = req.userId;
    const sender = users.find(u => u.id === userId);
    if (!sender) return res.status(400).json({ error: 'User not found.' });

    const from = sender.email;
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const recipient = users.find(u => u.email === to);
    if (!recipient) return res.status(400).json({ error: 'Recipient User not found.' });

    const fullText = `${subject} ${body}`;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const linksInText = fullText.match(urlRegex) || [];

    let isSpam = false;
    for (const blacklisted of blacklist) {
      if (linksInText.includes(blacklisted.link)) {
        isSpam = true;
        break;
      }
    }

    const attachments = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const baseMail = {
      from,
      to,
      subject,
      body,
      attachments,
      date: new Date().toISOString()
    };

    const senderMail = {
      id: getNextMailId(),
      ...baseMail,
      isRead: true,
      label: 'sent'
    };

    const recipientMail = {
      id: getNextMailId(),
      ...baseMail,
      isRead: false,
      ...(isSpam && { label: 'spam' })
    };

    mails.push(senderMail, recipientMail);

    return res.status(201).json({
      message: isSpam ? 'Mail created and delivered to recipient as spam' : 'Mail sent',
      id: senderMail.id
    });
  },

  createDraftMail: (req, res) => {
    const userId = req.userId;
    const sender = users.find(u => u.id === userId);
    if (!sender) return res.status(400).json({ error: 'User not found.' });

    const from = sender.email;
    const { to, subject, body } = req.body;

    const attachments = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const draftMail = {
      id: getNextMailId(),
      from,
      to,
      subject,
      body,
      attachments,
      isRead: true,
      label: 'drafts',
      date: new Date().toISOString(),
    };

    mails.push(draftMail);
    return res.status(201).json({ message: 'Mail saved to drafts', id: draftMail.id });
  },

  getUserMails: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ error: 'User not found.' });

    const userMails = mails
      .filter(mail =>
        (mail.from === user.email && mail.label === 'sent') ||
        (mail.to === user.email && (!mail.label || mail.label === 'spam'))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50)
      .map(mail => {
        const senderUser = users.find(u => u.email === mail.from);
        return {
          ...mail,
          direction: mail.to === user.email ? 'inbox' : 'sent',
          fromName: senderUser?.name || mail.from,
          fromProfilePicUrl: senderUser?.profilePic
            ? `/uploads/${senderUser.profilePic}`
            : '/uploads/default-avatar.jpg'
        };
      });

    res.json(userMails);
  },

  getIdMails: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id == userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const mail = mails.find(m => m.id == id);
    if (!mail) return res.status(404).json({ error: 'Access denied' });
    if (mail.from !== user.email && mail.to !== user.email) return res.status(403).json({ error: 'Access denied' });

    const senderUser = users.find(u => u.email === mail.from);

    res.json({
      ...mail,
      direction: mail.to === user.email ? 'inbox' : 'sent',
      fromName: senderUser?.name || mail.from,
      fromProfilePicUrl: senderUser?.profilePic
        ? `/uploads/${senderUser.profilePic}`
        : '/uploads/default-avatar.jpg'
    });
  },

  updateMail: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const mailIndex = mails.findIndex(m => m.id == id);
    if (mailIndex === -1) return res.status(404).json({ error: 'Access denied.' });

    const mail = mails[mailIndex];
    if (mail.to !== user.email && mail.from !== user.email) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updatedMail = { ...mail, ...req.body };
    mails[mailIndex] = updatedMail;

    if (updatedMail.label === 'spam') {
      const text = `${updatedMail.subject} ${updatedMail.body}`;
      const links = (text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/g) || []);
      for (const link of links) {
        if (!blacklist.some(item => item.link === link)) {
          blacklist.push({ link });
          console.log(`Blacklisted by user: ${link}`);
        }
      }
    }

    res.json(updatedMail);
  },

  assignLabelsToMail: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(403).json({ error: 'Not logged in' });

    const mailId = req.params.id;
    const { labels: newLabels } = req.body;

    if (!Array.isArray(newLabels)) {
      return res.status(400).json({ error: 'Labels must be an array' });
    }

    const mailIndex = mails.findIndex(m => m.id === mailId);
    if (mailIndex === -1) {
      return res.status(404).json({ error: 'Mail not found' });
    }

    const mail = mails[mailIndex];
    const isOwner = mail.from === user.email || mail.to === user.email;
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    mails[mailIndex].labels = Array.from(new Set([...(mail.labels || []), ...newLabels]));
    return res.json(mails[mailIndex]);
  },

  deleteMail: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const id = req.params.id;
    const mailIndex = mails.findIndex(m => m.id == id);
    if (mailIndex === -1) return res.status(404).json({ error: 'Mail not found.' });

    const mail = mails[mailIndex];
    const isUserCopy = mail.from === user.email || mail.to === user.email;
    if (!isUserCopy) return res.status(403).json({ error: 'Access denied.' });

    mails.splice(mailIndex, 1);
    res.status(204).end();
  },

  search: (req, res) => {
    const query = req.params.query.toLowerCase();
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const filterMails = (predicate) =>
      mails
        .filter(predicate)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50)
        .map(mail => {
          const senderUser = users.find(u => u.email === mail.from);
          return {
            ...mail,
            direction: mail.to === user.email ? 'inbox' : 'sent',
            fromName: senderUser?.name || mail.from,
            fromProfilePicUrl: senderUser?.profilePic
              ? `/uploads/${senderUser.profilePic}`
              : '/uploads/default-avatar.jpg'
          };
        });

    if (query === 'sent') return res.json(filterMails(mail => mail.from === user.email && mail.label === 'sent'));
    if (query === 'received') return res.json(filterMails(mail => mail.to === user.email && !mail.label));
    if (query === 'spam') return res.json(filterMails(mail => mail.to === user.email && mail.label === 'spam'));
    if (query === 'important') return res.json(filterMails(mail => mail.label === 'important'));
    if (query === 'drafts') return res.json(filterMails(mail => mail.from === user.email && mail.label === 'drafts'));

    const labelResults = filterMails(mail =>
      ((mail.from === user.email && mail.label === 'sent') ||
        (mail.to === user.email && (!mail.label || mail.label === 'spam')))
      && (mail.labels || []).some(label => label.toLowerCase() === query)
    );
    if (labelResults.length > 0) return res.json(labelResults);

    const results = filterMails(mail =>
      ((mail.from === user.email && mail.label === 'sent') ||
        (mail.to === user.email && (!mail.label || mail.label === 'spam')))
      && (
        mail.subject.toLowerCase().includes(query) ||
        mail.body.toLowerCase().includes(query) ||
        mail.from.toLowerCase().includes(query)
      )
    );

    return res.json(results);
  },

  bulkUpdateReadStatus: (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(403).json({ error: 'Not logged in' });

    const { ids, isRead } = req.body;
    if (!Array.isArray(ids) || typeof isRead !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    let updatedCount = 0;
    for (const id of ids) {
      const mailIndex = mails.findIndex(m => m.id === id);
      if (mailIndex === -1) continue;

      const mail = mails[mailIndex];
      const isRecipient = mail.to === user.email;
      if (isRecipient) {
        mails[mailIndex].isRead = isRead;
        updatedCount++;
      }
    }

    return res.json({ message: `${updatedCount} mails updated` });
  },

  markAsImportant: (req, res) => {
    const userId = req.userId;
    const mailId = req.params.id;

    const user = users.find(u => u.id === userId);
    if (!user) return res.status(403).json({ error: 'Not authorized' });

    const originalMail = mails.find(m => m.id === mailId);
    if (!originalMail || (originalMail.to !== user.email && originalMail.from !== user.email)) {
      return res.status(404).json({ error: 'Mail not found or access denied' });
    }

    const isAlreadyImportant = mails.some(m =>
      m.label === 'important' &&
      m.subject === originalMail.subject &&
      m.body === originalMail.body &&
      m.from === originalMail.from &&
      m.to === originalMail.to &&
      m.date === originalMail.date
    );

    if (isAlreadyImportant) {
      const importantIndex = mails.findIndex(m =>
        m.label === 'important' &&
        m.subject === originalMail.subject &&
        m.body === originalMail.body &&
        m.from === originalMail.from &&
        m.to === originalMail.to &&
        m.date === originalMail.date
      );
      if (importantIndex !== -1) {
        mails.splice(importantIndex, 1);
        return res.status(200).json({ message: 'Unmarked as important' });
      }
    }

    const importantCopy = {
      ...originalMail,
      id: getNextMailId(),
      label: 'important',
      isRead: true,
    };

    mails.push(importantCopy);
    return res.status(201).json({ message: 'Marked as important' });
  }
};
