import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import AnimeCard from '../components/AnimeCard';
import Footer from '../components/Footer';
import logoSvg from '../assets/logo.svg';
import './Profile.css';

const TABS = [
  { key: 'watching', label: 'Смотрю' },
  { key: 'completed', label: 'Просмотренное' },
  { key: 'planned', label: 'Буду смотреть' },
];

const ProfileContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { collections, loading: collLoading, removeFromCollection, updateCollectionType } = useCollections();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('watching');

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
        <motion.div className="profile-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} />

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <img src={user.avatar || logoSvg} alt={user.username} />
          </div>
          <div className="online-status">
            <span className="status-dot" />
            <span className="status-text">Online</span>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          {user.bio && <p className="profile-status">{user.bio}</p>}
        </div>

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
