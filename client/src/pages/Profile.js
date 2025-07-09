import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SidebarLayout from '../components/SidebarLayout';
import DefaultAvatar from '../assets/default-avatar.jpg';
import {authFetch} from '../utils/authFetch';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authFetch(`/api/users/${user?.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not fetch user info');
        setUserInfo(data);
        setName(data.name);
        setPreviewUrl(`/uploads/${data.profilePic}`);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      return setPasswordMsg('New passwords do not match');
    }

    try {
      const res = await authFetch(`/api/users/${user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPasswordMsg('✅ Password updated! Logging you out...');
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setPasswordMsg(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    setUpdateMsg('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (newProfilePic) {
        formData.append('profilePic', newProfilePic);
      }

      const res = await authFetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserInfo(data.user);
      setEditMode(false);
      setNewProfilePic(null);
      setUpdateMsg('Profile updated!');
    } catch (err) {
      setUpdateMsg(err.message);
    }
  };

  if (error) return <SidebarLayout><p className="error-msg">{error}</p></SidebarLayout>;
  if (!userInfo) return <SidebarLayout><p>Loading profile...</p></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="profile-card">
          <label htmlFor="avatarUpload" className="avatar-label">
            <img
              src={previewUrl || DefaultAvatar}
              alt="Profile"
              className="profile-avatar"
            />
          </label>
          {editMode && (
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          )}

          {!editMode ? (
            <h2>{userInfo.name}</h2>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-input"
              placeholder="Enter name"
            />
          )}

          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Date of Birth:</strong> {userInfo.dateOfBirth || 'Not set'}</p>

          <div className="button-group">
            {!editMode ? (
              <button className="change-password-toggle" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            ) : (
              <>
                <button className="change-password-toggle" onClick={handleUpdateProfile}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </>
            )}

            {!showPasswordForm && (
              <button className="change-password-toggle" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </button>
            )}
          </div>

          {updateMsg && <p className="status-msg">{updateMsg}</p>}

          {showPasswordForm && (
            <div className="change-password-section">
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit">Update Password</button>
                <button type="button" onClick={() => setShowPasswordForm(false)} className="cancel-btn">
                  Cancel
                </button>
                {passwordMsg && <p className="status-msg">{passwordMsg}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
