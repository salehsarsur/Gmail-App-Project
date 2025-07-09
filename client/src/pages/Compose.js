import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SidebarLayout from '../components/SidebarLayout';
import { authFetch } from '../utils/authFetch';
import './Compose.css';

export default function Compose() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [fileInputs, setFileInputs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await authFetch(`/api/mails/${draftId}`);
        const data = await res.json();
        if (res.ok) {
          setTo(data.to || '');
          setSubject(data.subject || '');
          setBody(data.body || '');
          setAttachments((data.attachments || []).map(url => ({
            name: url.split('/').pop(),
            data: url
          })));
        }
      } catch (err) {
        console.error('Failed to load draft', err);
      }
    };
    if (draftId) loadDraft();
  }, [draftId]);

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) favicon.href = isDarkMode ? '/hot-icon.png' : '/ice-icon.png';
    document.title = isDarkMode ? 'HotMail - Compose' : 'IceMail - Compose';
  }, [isDarkMode]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
        setFileInputs(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setFileInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('body', body);
      fileInputs.forEach(file => formData.append('images', file));

      const res = await authFetch('/api/mails', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send mail');

      if (draftId) {
        await authFetch(`/api/mails/${draftId}`, { method: 'DELETE' });
      }

      navigate('/inbox');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('body', body);
      fileInputs.forEach(file => formData.append('images', file));

      const res = await authFetch('/api/mails/draft', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save draft');
      navigate('/inbox?filter=drafts');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SidebarLayout>
      <h2>Compose New Email</h2>
      {error && <p className="error-msg">{error}</p>}
      <form className="compose-form" onSubmit={handleSend}>
        <label>To:</label>
        <input type="email" value={to} onChange={(e) => setTo(e.target.value)} required />

        <label>Subject:</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />

        <label>Body:</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows="8" required />

        <label>Attach Images:</label>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />

        <div className="attachment-preview">
          {attachments.map((file, index) => (
            <div key={index} className="thumb">
              <img src={file.data} alt={file.name} />
              <button type="button" onClick={() => removeAttachment(index)}>×</button>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button type="submit" className="send-btn">Send</button>
          <button type="button" className="send-btn draft-btn" onClick={handleSaveDraft}>Save as Draft</button>
        </div>
      </form>
    </SidebarLayout>
  );
}
