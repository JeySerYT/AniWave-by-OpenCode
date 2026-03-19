import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '../components/AnimeCard';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import logoSvg from '../assets/logo.svg';
import './Profile.css';

const PROFILE_KEY = 'user_profile';

const defaultProfile = {
  banner: '',
  avatar: '',
  username: 'Anime Fan',
  bio: 'Love watching anime!',
  joinDate: new Date().toISOString()
};

const getProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

const saveProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

const ImageUploadModal = ({ isOpen, onClose, onSave, currentImage, type, t }) => {
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(currentImage || '');
    }
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleSave = () => {
    onSave(preview);
    onClose();
  };

  const handleClear = () => {
    setPreview('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2 className="modal-title">{t('uploadImage')}</h2>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button className="clear-btn" onClick={handleClear}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                {t('delete')}
              </button>
            </div>
          ) : (
            <>
              <div className="drop-zone-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="drop-zone-text">{t('dragDrop')}</p>
              <div className="drop-zone-divider">
                <span>{t('or')}</span>
              </div>
              <button className="select-file-btn" onClick={() => fileInputRef.current?.click()}>
                {t('selectFile')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose}>{t('cancel')}</button>
          <button className="modal-save-btn" onClick={handleSave} disabled={!preview}>
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="language-toggle">
      <button 
        className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
        onClick={() => setLanguage('ru')}
      >
        RU
      </button>
      <button 
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

const ProfileContent = () => {
  const [profile, setProfile] = useState(getProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { favorites } = useFavorites();
  const { t } = useLanguage();

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedProfile = { ...editForm, joinDate: profile.joinDate };
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

  const handleBannerSave = (base64) => {
    const updatedProfile = { ...profile, banner: base64 };
    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setEditForm(updatedProfile);
  };

  const handleAvatarSave = (base64) => {
    const updatedProfile = { ...profile, avatar: base64 };
    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setEditForm(updatedProfile);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const locale = 'en';
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU', { month: 'long', year: 'numeric' });
  };

  const bannerStyle = profile.banner
    ? { backgroundImage: `url(${profile.banner})` }
    : { background: 'linear-gradient(135deg, #E53935 0%, #FF4081 50%, #7C4DFF 100%)' };

  return (
    <div className="profile-page">
      <div className="profile-banner" style={bannerStyle}>
        <div className="profile-banner-overlay" />
        <div className="profile-banner-gradient" />
        {isEditing && (
          <button className="edit-image-btn banner-edit" onClick={() => setShowBannerModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="profile-content">
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-avatar-wrapper">
            {isEditing && (
              <button className="edit-image-btn avatar-edit" onClick={() => setShowAvatarModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <div className="profile-avatar">
              <img src={profile.avatar || logoSvg} alt={profile.username} />
            </div>
          </div>
          
          <div className="profile-info">
            <div className="profile-settings">
              <LanguageToggle />
            </div>
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleChange}
                  className="edit-input"
                  placeholder="Username"
                />
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  className="edit-textarea"
                  placeholder="Bio"
                  rows={3}
                />
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave}>{t('save')}</button>
                  <button className="cancel-btn" onClick={handleCancel}>{t('cancel')}</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{profile.username}</h1>
                <p className="profile-bio">{profile.bio}</p>
                <p className="profile-joined">{t('joined')} {formatDate(profile.joinDate)}</p>
                <button className="edit-profile-btn" onClick={handleEdit}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {t('editProfile')}
                </button>
              </>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-red)" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="stat-value">{favorites.length}</span>
              <span className="stat-label">{t('favorites')}</span>
            </div>
          </div>
        </motion.div>

        <motion.section 
          className="favorites-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="favorites-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
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

      <ImageUploadModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onSave={handleBannerSave}
        currentImage={profile.banner}
        type="banner"
        t={t}
      />
      <ImageUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSave={handleAvatarSave}
        currentImage={profile.avatar}
        type="avatar"
        t={t}
      />
    </div>
  );
};

const Profile = () => {
  return <ProfileContent />;
};

export default Profile;
