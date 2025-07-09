import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MailCard from '../components/MailCard';
import SidebarLayout from '../components/SidebarLayout';
import { authFetch } from '../utils/authFetch';

export default function Inbox() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mails, setMails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedMailIds, setSelectedMailIds] = useState([]);

  const filter = new URLSearchParams(location.search).get('filter') || 'all';

  useEffect(() => {
    const fetchMails = async () => {
      try {
        const url = filter === 'all' ? '/api/mails' : `/api/mails/search/${filter}`;
        const res = await authFetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch mails');
        setMails(data);
        setSelectedMailIds([]);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user?.id) fetchMails();
  }, [user?.id, filter]);

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = isDarkMode ? '/hot-icon.png' : '/ice-icon.png';
    }
    document.title = isDarkMode ? 'HotMail - Inbox' : 'IceMail - Inbox';
  }, [isDarkMode]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await authFetch(`/api/mails/search/${searchQuery}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setMails(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelect = (mailId) => {
    setSelectedMailIds((prev) =>
      prev.includes(mailId)
        ? prev.filter((id) => id !== mailId)
        : [...prev, mailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMailIds.length === mails.length) {
      setSelectedMailIds([]);
    } else {
      const allIds = mails.map((m) => m.id);
      setSelectedMailIds(allIds);
    }
  };

  const markSelectedAsReadOrUnread = async (isRead) => {
    try {
      await Promise.all(
        selectedMailIds.map((id) =>
          authFetch(`/api/mails/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead })
          })
        )
      );
      setSelectedMailIds([]);
      const refreshed = await authFetch('/api/mails');
      const data = await refreshed.json();
      setMails(data);
    } catch {
      setError('Failed to update read/unread status');
    }
  };

  const markAsReadToggle = async (mailId, isRead) => {
    try {
      await authFetch(`/api/mails/${mailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      });
      const refreshed = await authFetch('/api/mails');
      const data = await refreshed.json();
      setMails(data);
    } catch {
      setError('Failed to toggle read status');
    }
  };

  return (
    <SidebarLayout>
      <h2>Inbox</h2>

      <button
        onClick={() => navigate('/compose')}
        style={{
          ...styles.createMailBtn,
          backgroundColor: isDarkMode ? '#ff5722' : '#007bff',
          color: '#fff',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = isDarkMode ? '#e64a19' : '#0056b3';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = isDarkMode ? '#ff5722' : '#007bff';
        }}
      >
        + Create Mail
      </button>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search mail…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearch}>Search</button>
      </div>

      {mails.length > 0 && (
        <div className="select-all-container">
          <label className="select-all-label">
            <input
              type="checkbox"
              checked={selectedMailIds.length === mails.length}
              onChange={handleSelectAll}
            />
            <span>Select All</span>
          </label>
        </div>
      )}

      {selectedMailIds.length > 0 && (
        <div className="read-actions">
          <button className="icloud-btn" onClick={() => markSelectedAsReadOrUnread(true)}>Mark as Read</button>
          <button className="icloud-btn secondary" onClick={() => markSelectedAsReadOrUnread(false)}>Mark as Unread</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mails.length === 0 ? (
        <p>No emails found.</p>
      ) : (
        mails.map((mail) => (
          <MailCard
            key={mail.id}
            mail={mail}
            selectable={true}
            isSelected={selectedMailIds.includes(mail.id)}
            toggleSelect={toggleSelect}
            markAsReadToggle={markAsReadToggle}
          />
        ))
      )}
    </SidebarLayout>
  );
}

const styles = {
  createMailBtn: {
    padding: '10px 18px',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
    marginBottom: '12px'
  },
};
