import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icelogo from '../assets/IceMail.png';
import Hotlogo from '../assets/HotMail.png';
import ToggleThemeButton from '../components/ToggleThemeButton';

export default function Login() {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user.id, data.user.email, data.token, data.user.profilePic);
      navigate('/inbox');
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

      <form className="login-form" onSubmit={handleSubmit}>
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

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="btn-primary"
          style={{
            backgroundColor: isDarkMode ? '#ff5722' : '#007bff',
          }}
        >
          Login
        </button>
      </form>

      <p className="signup-link">
        Don’t have an account?{' '}
        <button
          type="button"
          className="btn-link"
          onClick={() => navigate('/signup')}
        >
          Signup here
        </button>
      </p>

      <ToggleThemeButton /> {}
    </div>
  );
}
