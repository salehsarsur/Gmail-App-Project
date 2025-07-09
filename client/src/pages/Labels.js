import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SidebarLayout from '../components/SidebarLayout';
import { authFetch } from '../utils/authFetch'; // ✅ import secure fetch

export default function Labels() {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = isDarkMode ? '/hot-icon.png' : '/ice-icon.png';
    }
    document.title = isDarkMode ? 'HotMail - Labels' : 'IceMail - Labels';
  }, [isDarkMode]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await authFetch('/api/labels', { token });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch labels');
        setLabels(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchLabels();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/labels', {
        method: 'POST',
        token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setNewLabel('');
      setLabels((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/labels/${id}`, {
        method: 'DELETE',
        token,
      });
      setLabels((prev) => prev.filter((label) => label.id !== id));
    } catch (err) {
      setError('Delete failed');
    }
  };

  return (
    <SidebarLayout>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Labels</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            backgroundColor: 'var(--form-bg)',
            padding: '15px',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New label name"
            required
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              color: 'var(--text-color)',
              backgroundColor: 'var(--background-color)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Create
          </button>
        </form>

        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {labels.map((label) => (
            <li
              key={label.id}
              style={{
                backgroundColor: 'var(--form-bg)',
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ color: 'var(--text-color)' }}>{label.name}</span>
              <button
                onClick={() => handleDelete(label.id)}
                style={{
                  backgroundColor: '#ff4d4f',
                  border: 'none',
                  padding: '6px 10px',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </SidebarLayout>
  );
}
