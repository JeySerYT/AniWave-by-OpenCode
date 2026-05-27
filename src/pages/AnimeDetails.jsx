import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useAnimeById } from '../hooks/useAnime';
import { useFavorites } from '../hooks/useFavorites';
import './AnimeDetails.css';

const BASE_URL = 'https://anilibria.top';

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: anime, isLoading: loading, error, refetch } = useAnimeById(id);
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(id);

  const handleWatch = () => {
    navigate('/anime/' + id + '/watch');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Аниме';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const description = anime.description || 'Описание недоступно';

  return (
    <div className="anime-details">
      <div
        className="details-banner"
        style={{ backgroundImage: poster ? 'url(' + (poster.startsWith('/') ? BASE_URL + poster : poster) + ')' : 'none' }}
      >
        <div className="banner-overlay" />
        <div className="banner-gradient" />
      </div>

      <div className="details-content">
        <div className="details-main">
          <div className="details-left">
            <div className="details-cover">
              {poster && (
                <img
                  src={poster.startsWith('/') ? BASE_URL + poster : poster}
                  alt={title}
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
              )}
              <button
                className={'cover-favorite-btn' + (favorite ? ' active' : '')}
                onClick={() => toggleFavorite(id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={favorite ? '#ff4081' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            <div className="glass-card info-panel">
              {anime.year && (
                <div className="info-row">
                  <span className="info-label wide">Год</span>
                  <span className="info-value">{anime.year}</span>
                </div>
              )}
              {anime.type?.value && (
                <div className="info-row">
                  <span className="info-label wide">Тип</span>
                  <span className="info-value">{anime.type.description || anime.type.value}</span>
                </div>
              )}
              {anime.episodes_total && (
                <div className="info-row">
                  <span className="info-label wide">Эпизоды</span>
                  <span className="info-value">{anime.episodes_total}</span>
                </div>
              )}
              {anime.season?.value && (
                <div className="info-row">
                  <span className="info-label wide">Сезон</span>
                  <span className="info-value">{anime.season.description || anime.season.value}</span>
                </div>
              )}
              {anime.average_duration_of_episode && (
                <div className="info-row">
                  <span className="info-label wide">Длительность</span>
                  <span className="info-value">{anime.average_duration_of_episode} мин.</span>
                </div>
              )}
              {anime.age_rating?.label && (
                <div className="info-row">
                  <span className="info-label wide">Возраст</span>
                  <span className="info-value">{anime.age_rating.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="details-right">
            <div className="title-row">
              <h1 className="details-title">{title}</h1>
            </div>

            {anime.name?.english && anime.name?.main && (
              <p className="details-title-native">{anime.name.english}</p>
            )}

            <div className="details-meta">
              {anime.year && <span className="meta-item"><span>{anime.year}</span></span>}
              {anime.type?.value && <span className="meta-item"><span>{anime.type.description || anime.type.value}</span></span>}
              {anime.episodes_total && <span className="meta-item"><span>{anime.episodes_total} эп.</span></span>}
              {anime.season?.value && <span className="meta-item"><span>{anime.season.description || anime.season.value}</span></span>}
            </div>

            <div className="details-meta" style={{ marginTop: '1rem' }}>
              <button
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #E53935, #FF4081)',
                  border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 600,
                  borderRadius: '9999px', cursor: 'pointer'
                }}
                onClick={handleWatch}
              >
                ▶ Смотреть
              </button>
              <button
                className={'meta-item' + (favorite ? '' : '')}
                onClick={() => toggleFavorite(id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.9rem', background: favorite ? 'rgba(255,64,129,0.15)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid ' + (favorite ? 'rgba(255,64,129,0.3)' : 'rgba(255,255,255,0.08)'),
                  borderRadius: '9999px', cursor: favorite ? 'pointer' : 'pointer',
                  fontSize: '0.85rem', color: favorite ? '#FF4081' : 'var(--text-secondary)'
                }}
              >
                {favorite ? '★ В избранном' : '☆ В избранное'}
              </button>
            </div>

            <div className="glass-card details-description">
              <p>{description}</p>
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="details-genres">
                {anime.genres.map(genre => (
                  <span key={genre.id} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;