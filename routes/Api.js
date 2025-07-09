const express = require('express');
const router = express.Router(); // must be defined before you use it

const multer = require('multer');
const path = require('path');

//Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const UserController = require('../controllers/UserController');
const MailController = require('../controllers/MailController');
const LabelController = require('../controllers/LabelController');
const BlacklistController = require('../controllers/BlacklistController');
const auth = require('../middlewares/auth');

router.post('/users', upload.single('profilePic'), UserController.signup);
router.patch('/users/:id/password', auth, UserController.changePassword);
router.patch('/users/:id', upload.single('profilePic'), auth, UserController.updateUser);
router.get('/users/:id', auth, UserController.getUserInfo);
router.post('/tokens', UserController.login);

router.get('/mails', auth, MailController.getUserMails);
router.post('/mails', auth, upload.array('images'), MailController.createMail);
router.get('/mails/:id', auth, MailController.getIdMails);
router.patch('/mails/:id', auth, MailController.updateMail);
router.delete('/mails/:id', auth, MailController.deleteMail);
router.post('/mails/:id/labels', auth, MailController.assignLabelsToMail);
router.patch('/mails/bulk-read', auth, MailController.bulkUpdateReadStatus);
router.post('/mails/:id/important', auth, MailController.markAsImportant);
router.post('/mails/draft', auth, upload.array('images'), MailController.createDraftMail);

router.get('/labels', auth, LabelController.getLabelsByUser);
router.post('/labels', auth, LabelController.createLabel);
router.get('/labels/:id', auth, LabelController.getLabelsById);
router.patch('/labels/:id', auth, LabelController.updateLabel);
router.delete('/labels/:id', auth, LabelController.deleteLabel);

router.post('/blacklist', auth, BlacklistController.addToBlacklist);
router.delete('/blacklist/:id', auth, BlacklistController.removeFromBlacklist);

router.get('/mails/search/:query', auth, MailController.search);

module.exports = router;
