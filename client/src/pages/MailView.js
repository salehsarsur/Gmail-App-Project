import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SidebarLayout from '../components/SidebarLayout';
import { authFetch } from '../utils/authFetch';
import './MailView.css';

export default function MailView() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [mail, setMail] = useState(null);
  const [labels, setLabels] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) favicon.href = isDarkMode ? '/hot-icon.png' : '/ice-icon.png';
    document.title = isDarkMode ? 'HotMail - Mail View' : 'IceMail - Mail View';
  }, [isDarkMode]);

  useEffect(() => {
    const fetchMail = async () => {
      try {
        const res = await authFetch(`/api/mails/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch mail');
        setMail(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMail();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await authFetch(`/api/mails/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      setSuccess('Deleted');
      setTimeout(() => navigate('/inbox'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkSpam = async () => {
    try {
      const res = await authFetch(`/api/mails/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label: 'spam' })
      });
      if (!res.ok) throw new Error('Spam update failed');
      setSuccess('Marked as spam');
      setTimeout(() => navigate('/inbox?filter=spam'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLabels = async () => {
    try {
      const res = await authFetch('/api/labels');
      const data = await res.json();
      setLabels(data);
    } catch {
      setLabels([]);
    }
  };

  const handleAssignLabel = async (labelName) => {
    try {
      await authFetch(`/api/mails/${id}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labels: [labelName] })
      });
      setMail(prev => ({
        ...prev,
        labels: Array.from(new Set([...(prev.labels || []), labelName]))
      }));
      setShowDropdown(false);
    } catch {
      alert('Failed to assign label');
    }
  };

  const handleRemoveLabel = async (labelName) => {
    const remaining = (mail.labels || []).filter(l => l !== labelName);
    try {
      await authFetch(`/api/mails/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ labels: remaining })
      });
      setMail(prev => ({ ...prev, labels: remaining }));
    } catch {
      alert('Failed to remove label');
    }
  };

  const handleEditDraft = () => {
    navigate(`/compose?draftId=${mail.id}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (error) return <SidebarLayout><p className="mail-error">{error}</p></SidebarLayout>;
  if (!mail) return <SidebarLayout><p className="mail-loading">Loading mail...</p></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="mail-view-container">
        <div className="mail-view-header">
          <h2>{mail.subject}</h2>
          <div className="mail-view-meta">
            <img
              src={mail.fromProfilePicUrl ? `${mail.fromProfilePicUrl}?t=${Date.now()}` : '/uploads/default-avatar.jpg'}
              alt="Sender"
              className="sender-avatar"
            />
            <span><strong>To:</strong> {mail.to}</span>
            <span className="mail-view-date">
              {mail.date ? new Date(mail.date).toLocaleString() : 'No date'}
            </span>
          </div>
        </div>

        <div className="mail-view-body">
          <p>{mail.body}</p>
          {mail.attachments && mail.attachments.length > 0 && (
            <div className="attachments">
              <h4>Attachments:</h4>
              {mail.attachments.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`attachment-${idx}`}
                  style={{ maxWidth: '300px', marginBottom: '10px', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}
        </div>

        {}
        <div className="label-section">
          {(mail.labels || []).map((label, idx) => (
            <span className="assigned-label" key={idx}>
              {label}
              <span className="remove-label" onClick={() => handleRemoveLabel(label)}>✕</span>
            </span>
          ))}

          <div className="assign-label-wrapper" ref={dropdownRef}>
            <button
              className="assign-label-btn"
              onClick={() => {
                setShowDropdown(!showDropdown);
                fetchLabels();
              }}
            >
              Assign Label
            </button>
            {showDropdown && (
              <div className={`label-dropdown ${isDarkMode ? 'dark' : ''}`}>
                {labels.map(label => (
                  <div
                    key={label.id}
                    className="dropdown-label"
                    onClick={() => handleAssignLabel(label.name)}
                  >
                    {label.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mail-view-actions">
          {mail.to === user.email && mail.label !== 'spam' && (
            <button className="icloud-btn" onClick={handleMarkSpam}>Mark as Spam</button>
          )}
          <button className="icloud-btn secondary" onClick={handleDelete}>Delete</button>

          {}
          {mail.label === 'drafts' && mail.from === user.email && (
            <button className="icloud-btn" onClick={handleEditDraft}>Edit Draft</button>
          )}
        </div>

        {success && <p className="mail-success">{success}</p>}
      </div>
    </SidebarLayout>
  );
}
