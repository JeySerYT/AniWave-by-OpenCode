import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '../components/AnimeCard';
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
  const { anime, loading, error, refetch } = useAnimeById(id);
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
      {poster && (
        <div className="anime-details-banner">
          <img 
            src={poster.startsWith('/') ? BASE_URL + poster : poster}
            alt={title}
            className="banner-image"
          />
          <div className="banner-overlay" />
        </div>
      )}

      <div className="anime-details-content">
        <div className="anime-details-main">
          <div className="anime-details-header">
            <div className="anime-details-poster">
              {poster && (
                <img 
                  src={poster.startsWith('/') ? BASE_URL + poster : poster}
                  alt={title}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              )}
            </div>

            <div className="anime-details-info">
              <h1 className="anime-details-title">{title}</h1>
              <div className="anime-details-meta">
                {anime.year && <span>{anime.year}</span>}
                {anime.type?.value && <span>{anime.type.value}</span>}
                {anime.season?.value && <span>{anime.season.value}</span>}
                {anime.episodes_total && (
                  <span>{anime.episodes_total} эп.</span>
                )}
              </div>

              <div className="anime-details-actions">
                <button 
                  className={'favorite-btn ' + (favorite ? 'active' : '')}
                  onClick={() => toggleFavorite(id)}
                >
                  {favorite ? '★ В избранном' : '☆ В избранное'}
                </button>
                <button className="watch-btn" onClick={handleWatch}>
                  ▶ Смотреть
                </button>
              </div>

              <div className="anime-details-description">
                <h3>Описание</h3>
                <p>{description}</p>
              </div>

              {anime.genres && anime.genres.length > 0 && (
                <div className="anime-details-genres">
                  {anime.genres.map(genre => (
                    <span key={genre.id} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;
