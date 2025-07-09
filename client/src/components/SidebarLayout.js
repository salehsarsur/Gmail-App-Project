import TopBar from './TopBar';
import { NavLink } from 'react-router-dom';

export default function SidebarLayout({ children }) {
  const links = [
    { label: '📥 Inbox', to: '/inbox' },
    { label: '📤 Sent', to: '/inbox?filter=sent' },
    { label: '📩 Received', to: '/inbox?filter=received' },
    { label: '⭐ Important', to: '/inbox?filter=important' },
    { label: '📝 Drafts', to: '/inbox?filter=drafts' },
    { label: '🚫 Spam', to: '/inbox?filter=spam' },
    { label: '🏷️ Labels', to: '/labels' },
  ];

  return (
    <div style={styles.wrapper}>
      <TopBar />
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h2 style={styles.title}>Mailboxes</h2>
          <ul style={styles.menu}>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  layout: {
    display: 'flex',
    flexGrow: 1,
  },
  sidebar: {
    width: '220px',
    padding: '20px',
    backgroundColor: 'var(--form-bg)',
    borderRight: '1px solid #ccc',
  },
  title: {
    fontSize: '1.4rem',
    marginBottom: '20px',
    color: 'var(--text-color)',
  },
  menu: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  content: {
    flexGrow: 1,
    padding: '30px',
    backgroundColor: 'var(--background-color)',
    color: 'var(--text-color)',
  },
};
