import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '../components/AnimeCard';
import Footer from '../components/Footer';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import logoSvg from '../assets/logo.svg';
import './Profile.css';

const PROFILE_KEY = 'user_profile';

const defaultProfile = {
  banner: '',
  avatar: '',
  username: 'Anime Fan',
  bio: 'Love watching anime!'
};

const getProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

const ProfileContent = () => {
  const [profile, setProfile] = useState(getProfile);
  const [isOnline] = useState(true);
  const { favorites } = useFavorites();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [bannerDragging, setBannerDragging] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const saveProfile = (updatedProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
  };

  const handleSave = () => {
    const updatedProfile = { ...editForm };
    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    setBannerDragging(false);
    setAvatarDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({ ...prev, [field]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({ ...prev, [field]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const bannerStyle = profile.banner
    ? { backgroundImage: `url(${profile.banner})` }
    : { background: 'linear-gradient(135deg, #E53935 0%, #FF4081 50%, #7C4DFF 100%)' };

  return (
    <div className="profile-page">
      <div className="profile-content">
        <motion.div 
          className="profile-header"
          style={bannerStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <img src={profile.avatar || logoSvg} alt={profile.username} />
          </div>
          <div className="online-status">
            <span className="status-dot"></span>
            <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{profile.username}</h1>
          {profile.bio && <p className="profile-status">{profile.bio}</p>}
        </div>
        
        <motion.button
          className="edit-profile-btn"
          onClick={handleEdit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit Profile
        </motion.button>
        
        <motion.section 
          className="favorites-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="favorites-title">
            {t('favorites')}
            <span className="favorites-count">{favorites.length}</span>
          </h2>

          {favorites.length === 0 ? (
            <div className="empty-favorites">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <h3>{t('noFavoritesTitle')}</h3>
              <p>{t('noFavoritesText')}</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((anime, index) => (
                <AnimeCard key={anime.id} anime={anime} index={index} />
              ))}
            </div>
          )}
        </motion.section>
      </div>
      
      <Footer />
      
      {isEditing && (
        <div className="edit-modal-backdrop" onClick={handleCancel}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <div className="edit-field">
              <label>Username</label>
              <input type="text" name="username" value={editForm.username} onChange={handleChange} />
            </div>
            <div className="edit-field">
              <label>Banner</label>
              <div 
                className={`drop-zone ${bannerDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={(e) => { handleDragLeave(e); setBannerDragging(false); }}
                onDrop={(e) => handleDrop(e, 'banner')}
                onClick={() => bannerInputRef.current?.click()}
              >
                {editForm.banner ? (
                  <img src={editForm.banner} alt="Banner preview" className="drop-preview" />
                ) : (
                  <div className="drop-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Drop image or click</span>
                  </div>
                )}
              </div>
              <input 
                ref={bannerInputRef}
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileSelect(e, 'banner')} 
                style={{ display: 'none' }} 
              />
            </div>

            <div className="edit-field">
              <label>Avatar</label>
              <div 
                className={`drop-zone drop-zone-small ${avatarDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={(e) => { handleDragLeave(e); setAvatarDragging(false); }}
                onDrop={(e) => handleDrop(e, 'avatar')}
                onClick={() => avatarInputRef.current?.click()}
              >
                {editForm.avatar ? (
                  <img src={editForm.avatar} alt="Avatar preview" className="drop-preview-avatar" />
                ) : (
                  <div className="drop-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
              </div>
              <input 
                ref={avatarInputRef}
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileSelect(e, 'avatar')} 
                style={{ display: 'none' }} 
              />
            </div>
            <div className="edit-field">
              <label>Bio</label>
              <textarea name="bio" value={editForm.bio} onChange={handleChange} rows={3} />
            </div>
            <div className="edit-actions">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  return <ProfileContent />;
};

export default Profile;
