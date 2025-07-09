const path = require('path');
const { users, getNextUserId } = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'SalehMuradMostafa';

exports.signup = (req, res) => {
  const { email, password, name, dateOfBirth } = req.body;
  const profilePic = req.file?.filename || 'default-avatar.jpg';

  if (!email || !password || !name || !dateOfBirth) {
    return res.status(400).json({ error: 'Name, email, password, and date of birth are required' });
  }

  const emailRegex = /^[^\s@]+@(hotmail|icemail)\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email must end with @hotmail.com or @icemail.com' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters and include both letters and numbers',
    });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: getNextUserId(),
    name,
    email,
    password,
    profilePic,
    dateOfBirth
  };

  users.push(newUser);

  res.status(201).json({
    message: 'Signup successful',
    user: { id: newUser.id, email: newUser.email }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '3h' });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePic: user.profilePic,
      dateOfBirth: user.dateOfBirth
    }
  });
};

exports.getUserInfo = (req, res) => {
  const userId = req.userId;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    profilePic: user.profilePic,
    dateOfBirth: user.dateOfBirth
  });
};

exports.changePassword = (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.password !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'New password must be at least 6 characters and include both letters and numbers'
    });
  }

  user.password = newPassword;
  res.json({ message: 'Password updated successfully' });
};

exports.updateUser = (req, res) => {
  const userId = req.userId;
  const { name } = req.body;
  const profilePic = req.file?.filename;

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name) user.name = name;
  if (profilePic) user.profilePic = profilePic;

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      profilePic: user.profilePic,
      email: user.email,
      dateOfBirth: user.dateOfBirth
    }
  });
};
