import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FiUser, FiLock, FiMoon, FiSun, FiCamera } from 'react-icons/fi';
import './styles.css';

const SettingsPage = () => {
  const { user, updateProfile, changePassword, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await api.post('/auth/profile/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser({ avatar_url: res.data.avatar_url });
      setMessage('Avatar uploaded!');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setMessage('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      await updateProfile({ theme: newTheme });
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ username, email, first_name: firstName });
      setMessage('Profile updated!');
    } catch (err) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage('Error changing password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3><FiUser /> Profile</h3>
        <form onSubmit={handleProfileSave} className="settings-form">
          <div className="avatar-section">
            <div className="avatar-large">
              {user?.avatar_url ? <img src={user.avatar_url} alt="avatar" /> : <span>{user?.username?.[0]?.toUpperCase()}</span>}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              className="avatar-upload-btn"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
            >
              <FiCamera /> {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
            </button>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            Save Profile
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h3><FiMoon /> Appearance</h3>
        <div className="theme-selector">
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            <FiSun /> Light
          </button>
          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            <FiMoon /> Dark
          </button>
          <button
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => handleThemeChange('system')}
          >
            <FiSun /><FiMoon /> System
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3><FiLock /> Change Password</h3>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            Change Password
          </button>
        </form>
      </section>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default SettingsPage;