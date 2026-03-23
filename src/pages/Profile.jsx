import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AnimeCard from '../components/AnimeCard';
import Footer from '../components/Footer';
import { useFavorites } from '../hooks/useFavorites';
import { translateMultipleToRussian } from '../utils/translation';
import logoSvg from '../assets/logo.svg';
import './Profile.css';

const ProfileContent = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [translatedTitles, setTranslatedTitles] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    banner: user?.banner || '',
    bio: user?.bio || ''
  });
  const [bannerDragging, setBannerDragging] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        avatar: user.avatar || '',
        banner: user.banner || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (favorites.length === 0 || language !== 'ru') return;

    const titlesToTranslate = favorites.map(anime => [
      anime.id,
      anime.title?.english || anime.title?.romaji || ''
    ]).filter(([_, title]) => title);

    if (titlesToTranslate.length === 0) return;

    translateMultipleToRussian(titlesToTranslate).then(results => {
      setTranslatedTitles(results);
    });
  }, [favorites, language]);

  const getTranslatedTitle = (anime) => {
    if (language !== 'ru') return null;
    return translatedTitles[anime.id] || null;
  };

  const handleEdit = () => {
    setEditForm({
      username: user?.username || '',
      avatar: user?.avatar || '',
      banner: user?.banner || '',
      bio: user?.bio || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
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

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="guest-profile">
          <motion.div 
            className="guest-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>{t('loginToContinue')}</h1>
            <p>{t('loginToContinueText')}</p>
            <div className="guest-actions">
              <motion.button
                className="guest-btn primary"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('login')}
              </motion.button>
              <motion.button
                className="guest-btn secondary"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('register')}
              </motion.button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const headerClass = editForm.banner ? 'profile-header' : 'profile-header default-banner';
  const headerStyle = editForm.banner ? { backgroundImage: `url(${editForm.banner})` } : {};

  return (
    <div className="profile-page">
      <div className="profile-content">
        <motion.div 
          className={headerClass}
          style={headerStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <img src={editForm.avatar || logoSvg} alt={editForm.username} />
          </div>
          <div className="online-status">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          {user.bio && <p className="profile-status">{user.bio}</p>}
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
          {t('editProfile')}
        </motion.button>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              background: '#ff6b6b',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear LocalStorage + Cache
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              background: '#feca57',
              border: 'none',
              borderRadius: '6px',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Auth
          </button>
          <button 
            onClick={() => {
              fetch('http://localhost:8081/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              }).finally(() => {
                localStorage.clear();
                window.location.href = '/';
              });
            }}
            style={{
              padding: '8px 16px',
              background: '#48dbfb',
              border: 'none',
              borderRadius: '6px',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
        
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
                <AnimeCard key={anime.id} anime={anime} index={index} translatedTitle={getTranslatedTitle(anime)} />
              ))}
            </div>
          )}
        </motion.section>
      </div>
      
      <Footer />
      
      {isEditing && (
        <div className="edit-modal-backdrop" onClick={handleCancel}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('editProfile')}</h2>
            <div className="edit-field">
              <label>{t('username')}</label>
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
              <button className="cancel-btn" onClick={handleCancel}>{t('cancel')}</button>
              <button className="save-btn" onClick={handleSave}>{t('save')}</button>
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
