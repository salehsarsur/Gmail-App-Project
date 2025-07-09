import { useTheme } from '../context/ThemeContext';

export default function ToggleThemeButton() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="btn-toggle-theme">
      {isDarkMode ? 'Switch to IceMail ❄️' : 'Switch to HotMail 🔥'}
    </button>
  );
}
