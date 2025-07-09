import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icelogo from '../assets/IceMail.png';
import Hotlogo from '../assets/HotMail.png';
import DefaultAvatar from '../assets/default-avatar.jpg';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/inbox');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <img
          src={isDarkMode ? Hotlogo : Icelogo}
          alt="Mail Logo"
          style={styles.logo}
          onClick={handleLogoClick}
          title="Go to Inbox"
        />
      </div>

      <div style={styles.right}>
        <button onClick={toggleTheme} style={styles.toggleBtn}>
          {isDarkMode ? 'Light Mode ❄️' : 'Dark Mode 🔥'}
        </button>

        {user && (
          <>
            <img
              src={user.profilePic ? `/uploads/${user.profilePic}?t=${Date.now()}` : DefaultAvatar}
              alt="Profile"
              onClick={handleProfileClick}
              style={styles.avatar}
              title="View Profile"
            />
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'var(--form-bg)',
    borderBottom: '1px solid #ccc',
    color: 'var(--text-color)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: '40px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer', // Add cursor pointer for logo
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  toggleBtn: {
    padding: '6px 12px',
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '2px solid #aaa',
  },
  logoutBtn: {
    padding: '6px 10px',
    backgroundColor: '#ff3b3b',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
