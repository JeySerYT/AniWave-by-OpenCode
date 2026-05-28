import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../api/config';
import AnimeCard from '../components/AnimeCard';
import Footer from '../components/Footer';
import './Profile.css';

const TABS = [
  { key: 'watching', label: 'Смотрю' },
  { key: 'completed', label: 'Просмотренное' },
  { key: 'planned', label: 'Буду смотреть' },
];

const ProfileContent = () => {
  const { user, loading: authLoading, refresh } = useAuth();
  const { collections, loading: collLoading, removeFromCollection, updateCollectionType } = useCollections();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('watching');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar: '', banner: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [bannerDragging, setBannerDragging] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);
  const modalRef = useRef(null);
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const openEdit = () => {
    setEditForm({ username: user?.username || '', avatar: user?.avatar || '', banner: user?.banner || '', bio: user?.bio || '' });
    setShowEdit(true);
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (макс. 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm(prev => ({ ...prev, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    setBannerDragging(false);
    setAvatarDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (макс. 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm(prev => ({ ...prev, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const body = {};
      if (editForm.username) body.username = editForm.username;
      if (editForm.avatar) body.avatar = editForm.avatar;
      if (editForm.banner) body.banner = editForm.banner;
      if (editForm.bio) body.bio = editForm.bio;

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await refresh();
        setShowEdit(false);
      } else {
        const data = await res.json();
        alert(data.detail || 'Ошибка сохранения');
      }
    } catch { alert('Ошибка сети'); }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner" />
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
              <motion.button className="guest-btn primary" onClick={() => navigate('/login')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {t('login')}
              </motion.button>
              <motion.button className="guest-btn secondary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {t('register')}
              </motion.button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentList = collections[activeTab] || [];

  const animeFromFavorite = (fav) => ({
    id: fav.anime_id,
    name: { main: fav.title },
    poster: { optimized: { src: fav.image }, preview: fav.image, src: fav.image },
  });

  return (
    <div className="profile-page">
      <div className="profile-content">
        <motion.div className="profile-header default-banner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} />

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-initials">{user.username?.[0]?.toUpperCase() || '?'}</div>
            )}
          </div>
          <div className="online-status">
            <span className="status-dot" />
            <span className="status-text">Online</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          {user.bio && <p className="profile-status">{user.bio}</p>}
          <motion.button
            className="edit-profile-btn"
            onClick={openEdit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Редактировать профиль</span>
          </motion.button>
        </div>

        {showEdit && (
          <div className="edit-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}>
            <motion.div className="edit-modal" ref={modalRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
              <h2>Редактировать профиль</h2>

              <div className="edit-field">
                <label>Имя пользователя</label>
                <input type="text" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} placeholder="Ваше имя" />
              </div>

              <div className="edit-field">
                <label>Аватар</label>
                <div
                  className={`drop-zone drop-zone-small ${avatarDragging ? 'dragging' : ''}`}
                  onClick={() => avatarInputRef.current?.click()}
                  onDragOver={(e) => { handleDragOver(e); setAvatarDragging(true); }}
                  onDragLeave={() => setAvatarDragging(false)}
                  onDrop={(e) => handleDrop(e, 'avatar')}
                >
                  {editForm.avatar ? (
                    <img src={editForm.avatar} alt="" className="drop-preview-avatar" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt="" className="drop-preview-avatar" />
                  ) : (
                    <div className="drop-placeholder">
                      <Upload size={20} />
                      <span>GIF, PNG, JPG</span>
                    </div>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/gif,image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => handleFileSelect(e, 'avatar')} />
                <input type="text" value={editForm.avatar.startsWith('data:') ? '' : editForm.avatar} onChange={e => setEditForm(f => ({ ...f, avatar: e.target.value }))} placeholder="Или вставьте URL аватара" style={{ marginTop: '0.5rem' }} />
              </div>

              <div className="edit-field">
                <label>Баннер</label>
                <div
                  className={`drop-zone ${bannerDragging ? 'dragging' : ''}`}
                  onClick={() => bannerInputRef.current?.click()}
                  onDragOver={(e) => { handleDragOver(e); setBannerDragging(true); }}
                  onDragLeave={() => setBannerDragging(false)}
                  onDrop={(e) => handleDrop(e, 'banner')}
                >
                  {editForm.banner ? (
                    <img src={editForm.banner} alt="" style={{ maxHeight: '80px', borderRadius: '8px' }} />
                  ) : user?.banner ? (
                    <img src={user.banner} alt="" style={{ maxHeight: '80px', borderRadius: '8px' }} />
                  ) : (
                    <div className="drop-placeholder">
                      <Upload size={24} />
                      <span>Перетащите или нажмите для загрузки GIF, PNG, JPG</span>
                    </div>
                  )}
                </div>
                <input ref={bannerInputRef} type="file" accept="image/gif,image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => handleFileSelect(e, 'banner')} />
                <input type="text" value={editForm.banner.startsWith('data:') ? '' : editForm.banner} onChange={e => setEditForm(f => ({ ...f, banner: e.target.value }))} placeholder="Или вставьте URL баннера" style={{ marginTop: '0.5rem' }} />
              </div>

              <div className="edit-field">
                <label>О себе</label>
                <textarea rows="3" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Расскажите о себе" />
              </div>

              <div className="edit-actions">
                <button className="cancel-btn" onClick={() => setShowEdit(false)}>Отмена</button>
                <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{collections[tab.key]?.length || 0}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={activeTab}
            className="collections-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {collLoading ? (
              <div className="profile-loading"><div className="loading-spinner" /></div>
            ) : currentList.length === 0 ? (
              <div className="empty-collection">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <h3>Пусто</h3>
                <p>Добавьте аниме из карточки на сайте</p>
              </div>
            ) : (
              <div className="collections-grid">
                {currentList.map((fav, i) => (
                  <div key={fav.id || fav.anime_id} className="collection-card-wrap">
                    <AnimeCard anime={animeFromFavorite(fav)} index={i} />
                    <div className="collection-card-actions">
                      {TABS.filter(t => t.key !== activeTab).map(tab => (
                        <button
                          key={tab.key}
                          className="coll-action-btn"
                          onClick={() => updateCollectionType(fav.anime_id, tab.key)}
                        >
                          {tab.label}
                        </button>
                      ))}
                      <button
                        className="coll-action-btn remove"
                        onClick={() => removeFromCollection(fav.anime_id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

const Profile = () => <ProfileContent />;

export default Profile;
