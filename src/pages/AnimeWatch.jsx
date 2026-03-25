import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { anilibriaApi } from '../api/anilibria';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './AnimeWatch.css';

const BASE_URL = 'https://anilibria.top';

const AnimeWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await anilibriaApi.getTitle(id);
        setAnime(data);
      } catch (err) {
        console.error('Failed to fetch anime data:', err);
        setError('Не удалось загрузить данные аниме');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Аниме';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const description = anime.description || '';

  return (
    <div className="anime-watch">
      <div className="watch-header">
        <button className="back-btn" onClick={() => navigate('/anime/' + id)}>
          ← Назад
        </button>
        <h1 className="watch-title">{title}</h1>
      </div>

      <div className="watch-content">
        <div className="player-container">
          {anime.external_player ? (
            <iframe
              src={anime.external_player}
              className="video-player"
              allowFullScreen
              title={title}
            />
          ) : (
            <div className="no-video">
              <p>Плеер недоступен</p>
              <p className="no-video-hint">Перейдите на сайт для просмотра</p>
            </div>
          )}
        </div>

        <div className="watch-info">
          <div className="watch-poster">
            {poster && <img src={poster.startsWith('/') ? BASE_URL + poster : poster} alt={title} />}
          </div>
          <div className="watch-details">
            <h2>{title}</h2>
            <p className="watch-description">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeWatch;
