import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function CreateMailButton() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    navigate('/compose');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...styles.button,
        backgroundColor: isDarkMode ? '#ff5722' : '#007bff',
        boxShadow: isDarkMode
          ? '0 4px 12px rgba(255, 87, 34, 0.5)'
          : '0 4px 12px rgba(0, 123, 255, 0.5)',
      }}
      aria-label="Create new mail"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: 8 }}
        width="24"
        height="24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-edit-2"
        viewBox="0 0 24 24"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7 21H3v-4L17 3z" />
      </svg>
      Create Mail
    </button>
  );
}

const styles = {
  button: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '12px 20px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    zIndex: 1000,
  },
};
