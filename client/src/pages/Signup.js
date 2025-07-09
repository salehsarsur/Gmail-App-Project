import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Icelogo from '../assets/IceMail.png';
import Hotlogo from '../assets/HotMail.png';
import DefaultAvatar from '../assets/default-avatar.jpg';
import ToggleThemeButton from '../components/ToggleThemeButton';

export default function Signup() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const validateEmail = (email) => {
    return email.endsWith('@hotmail.com') || email.endsWith('@icemail.com');
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { username, email, password, confirmPassword, dateOfBirth } = form;

    if (!validateEmail(email)) {
      return setError('Email must end with @hotmail.com or @icemail.com');
    }

    if (!validatePassword(password)) {
      return setError('Password must be at least 6 characters and contain letters and numbers');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!dateOfBirth) {
      return setError('Date of Birth is required');
    }

    try {
      const formData = new FormData();
      formData.append('name', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('dateOfBirth', dateOfBirth);
      if (profilePicture) {
        formData.append('profilePic', profilePicture);
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <img
        src={isDarkMode ? Hotlogo : Icelogo}
        alt={isDarkMode ? 'HotMail Logo' : 'IceMail Logo'}
        className="login-logo"
      />

      <form className="login-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group" style={{ textAlign: 'center' }}>
          <label htmlFor="profilePicture" style={{ cursor: 'pointer' }}>
            <img
              src={profilePicture ? URL.createObjectURL(profilePicture) : DefaultAvatar}
              alt="Profile Preview"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          </label>
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="profilePicture"
          />
          <p style={{ fontSize: '0.9rem' }}>Add Profile Picture (optional)</p>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            type="text"
            className="form-control"
            placeholder="Enter name"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email address</label>
          <input
            name="email"
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            className="form-control"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            className="form-control"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="btn-primary"
          style={{
            backgroundColor: isDarkMode ? '#ff5722' : '#007bff',
          }}
        >
          Sign Up
        </button>
      </form>

      <p className="signup-link">
        Already have an account?{' '}
        <button type="button" className="btn-link" onClick={() => navigate('/login')}>
          Login
        </button>
      </p>

      <ToggleThemeButton />
    </div>
  );
}
