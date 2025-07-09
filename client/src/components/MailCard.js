import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFlag, FaEdit } from 'react-icons/fa';
import { authFetch } from '../utils/authFetch';
import './MailCard.css';

export default function MailCard({ mail, selectable, isSelected, toggleSelect, markAsReadToggle }) {
  const navigate = useNavigate();
  const [isFlagged, setIsFlagged] = useState(mail.label === 'important');

  const handleClick = () => {
    navigate(`/mail/${mail.id}`);
  };

  const handleFlagClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await authFetch(`/api/mails/${mail.id}/important`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setIsFlagged(prev => !prev);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Failed to toggle important flag:', err.message);
    }
  };

  const handleEditDraft = (e) => {
    e.stopPropagation();
    navigate(`/compose?draftId=${mail.id}`);
  };

  return (
    <div className={`mail-card ${mail.isRead ? 'read' : 'unread'}`} onClick={handleClick}>
      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(mail.id);
          }}
          className="mail-checkbox"
        />
      )}

      <div className="tooltip">
        <img
          src={`${mail.fromProfilePicUrl}?t=${Date.now()}`}
          alt={mail.fromName || mail.from}
          className="sender-avatar"
        />
        <div className="tooltip-text">
          <strong>{mail.fromName || 'Unknown'}</strong><br />
          {mail.from}
        </div>
      </div>

      <div className="mail-content">
        <div className="mail-header">
          <strong>{mail.subject}</strong>
          <span className="mail-date">
            {new Date(mail.timestamp || mail.date).toLocaleDateString()}
          </span>
        </div>
        <div className="mail-from">
          From: <span>{mail.from}</span>
        </div>
        <div className="mail-body-preview">
          {mail.body.length > 100 ? mail.body.slice(0, 100) + '...' : mail.body}
        </div>
      </div>

      {mail.label === 'drafts' && (
        <div className="edit-draft-icon" onClick={handleEditDraft}>
          <FaEdit title="Edit Draft" />
        </div>
      )}

      <div className="flag-icon" onClick={handleFlagClick}>
        <FaFlag color={isFlagged ? 'orange' : 'gray'} />
      </div>

      <div className="read-toggle" onClick={(e) => {
        e.stopPropagation();
        markAsReadToggle(mail.id, !mail.isRead);
      }}>
      </div>
    </div>
  );
}
