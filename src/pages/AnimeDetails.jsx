import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { useAnimeById, usePopularAnime } from '../hooks/useAnime';
import { useFavorites } from '../hooks/useFavorites';
import './AnimeDetails.css';

const BASE_URL = 'https://anilibria.top';

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: anime, isLoading: loading, error, refetch } = useAnimeById(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: popular } = usePopularAnime();
  const favorite = isFavorite(id);

  const handleWatch = () => {
    navigate('/anime/' + id + '/watch');
  };

  const formatSeason = (season) => {
    const map = { winter: 'Зима', spring: 'Весна', summer: 'Лето', autumn: 'Осень' };
    return map[season?.value] || season?.description || season?.value || '';
  };

  const formatStatus = (isOngoing) => isOngoing ? 'Сейчас выходит' : 'Завершено';
  const formatType = (type) => type?.description || type?.value || '';

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Аниме';
  const description = anime.description || 'Описание недоступно';
  const genreNames = anime.genres?.map(g => g.name) || [];

  const related = popular
    ? popular
        .filter(a => a.id !== Number(id))
        .map(a => ({
          ...a,
          matchCount: (a.genres || []).filter(g => genreNames.includes(g.name)).length
        }))
        .filter(a => a.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 6)
    : [];

  return (
    <div className="anime-details">
      <motion.div
        className="details-banner"
        style={{ backgroundImage: poster ? 'url(' + (poster.startsWith('/') ? BASE_URL + poster : poster) + ')' : 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="banner-overlay" />
        <div className="banner-gradient" />
      </motion.div>

      <div className="details-content">
        <motion.div
          className="details-main"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="details-left">
            <motion.div
              className="details-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {poster && <img src={poster.startsWith('/') ? BASE_URL + poster : poster} alt={title} />}
              {anime.averageScore && (
                <div className="poster-rating">
                  <span className="star">★</span>
                  <span className="score">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              <motion.button
                className={'cover-favorite-btn' + (favorite ? ' active' : '')}
                onClick={() => toggleFavorite(id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.button>
            </motion.div>
          </div>

          <div className="details-right">
            <div className="title-row">
              <motion.h1
                className="details-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {title}
              </motion.h1>
              <div className="trailer-wrap">
                <motion.button
                  className="trailer-icon-btn"
                  onClick={handleWatch}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="trailer-text">Смотреть</span>
                </motion.button>
              </div>
            </div>
            {anime.name?.main && anime.name?.english && anime.name?.english !== anime.name?.main && (
              <motion.p
                className="details-title-native"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {anime.name.english}
              </motion.p>
            )}

            <motion.div
              className="details-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {anime.episodes_total && (
                <div className="meta-item">
                  <span>{anime.episodes_total}</span>
                  <span className="meta-label">эп.</span>
                </div>
              )}
              <div className="meta-item">
                <span>{formatStatus(anime.is_ongoing)}</span>
              </div>
              {anime.type?.value && (
                <div className="meta-item">
                  <span>{formatType(anime.type)}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              className="details-description glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>{description}</p>
            </motion.div>

            <motion.div
              className="info-panel glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {anime.genres?.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Жанры:</span>
                  <span className="info-value">{anime.genres.map(g => g.name).join(', ')}</span>
                </div>
              )}
              {anime.season?.value && (
                <div className="info-row">
                  <span className="info-label">Сезон:</span>
                  <span className="info-value">{formatSeason(anime.season)} {anime.year}</span>
                </div>
              )}
              {anime.type?.value && (
                <div className="info-row">
                  <span className="info-label">Тип:</span>
                  <span className="info-value">{formatType(anime.type)}</span>
                </div>
              )}
              {anime.year && (
                <div className="info-row">
                  <span className="info-label">Год:</span>
                  <span className="info-value">{anime.year}</span>
                </div>
              )}
              {anime.episodes_total && (
                <div className="info-row">
                  <span className="info-label">Эпизоды:</span>
                  <span className="info-value">{anime.episodes_total}</span>
                </div>
              )}
              {anime.average_duration_of_episode && (
                <div className="info-row">
                  <span className="info-label">Длительность:</span>
                  <span className="info-value">{anime.average_duration_of_episode} мин.</span>
                </div>
              )}
              {anime.age_rating?.label && (
                <div className="info-row">
                  <span className="info-label">Возраст:</span>
                  <span className="info-value">{anime.age_rating.label}</span>
                </div>
              )}
              {anime.name?.alternative && anime.name?.alternative !== anime.name?.main && (
                <div className="info-row">
                  <span className="info-label wide">Альт. названия:</span>
                  <span className="info-value">{anime.name.alternative}</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {related.length > 0 && (
          <motion.section
            className="related-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="related-title">Похожие по жанрам</h2>
            <div className="related-grid">
              {related.map((a, i) => (
                <AnimeCard key={a.id} anime={a} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;