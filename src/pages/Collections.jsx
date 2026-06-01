import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useFavorites';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid } from '../components/Skeleton';
import './Collections.css';

const TABS = [
  { key: 'watching', label: 'Смотрю' },
  { key: 'completed', label: 'Просмотренное' },
  { key: 'planned', label: 'Буду смотреть' },
];

const CollectionsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { collections, loading: collLoading, removeFromCollection, updateCollectionType } = useCollections();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('watching');

  if (authLoading) {
    return (
      <div className="collections-page">
        <div className="collections-container">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="collections-page">
        <div className="collections-guest">
          <motion.div
            className="guest-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Войдите, чтобы продолжить</h1>
            <p>Для доступа к коллекциям необходимо войти в аккаунт</p>
            <div className="guest-actions">
              <motion.button className="guest-btn primary" onClick={() => navigate('/login')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Войти
              </motion.button>
              <motion.button className="guest-btn secondary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Регистрация
              </motion.button>
            </div>
          </motion.div>
        </div>
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
    <div className="collections-page">
      <div className="collections-container">
        <motion.h1
          className="collections-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Мои коллекции
        </motion.h1>

        <div className="collections-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`collection-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="collection-tab-count">{collections[tab.key]?.length || 0}</span>
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
              <div className="collections-grid">
                <SkeletonGrid count={6} />
              </div>
            ) : currentList.length === 0 ? (
              <div className="collections-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <h3>Здесь пока пусто</h3>
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
                        className="coll-action-btn remove-btn"
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
    </div>
  );
};

export default CollectionsPage;
