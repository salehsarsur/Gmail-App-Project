import { useTheme } from '../context/ThemeContext';
import Hotlogo from '../assets/HotMail.png';
import Icelogo from '../assets/IceMail.png';

export default function MainLayout({ children }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="login-container">
      <img
        src={isDarkMode ? Hotlogo : Icelogo}
        alt="Mail Logo"
        className="login-logo"
      />
      <button onClick={toggleTheme} className="btn-toggle-theme">
        Switch to {isDarkMode ? 'IceMail ❄️' : 'HotMail 🔥'}
      </button>
      {children}
    </div>
  );
}
