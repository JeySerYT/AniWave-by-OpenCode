import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AnimeCard.css';

const BASE_URL = 'https://anilibria.top';

const AnimeCard = ({ anime, index = 0 }) => {
  if (!anime) return null;
  
  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const rating = null;
  const episodes = anime.episodes_total;
  const animeCode = anime.alias || anime.id;
  const animeYear = anime.year;
  const animeType = anime.type?.value;

  return (
    <motion.div
      className="anime-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
    >
      <Link to={'/anime/' + animeCode} className="anime-card-link">
        <div className="anime-card-image">
          {poster && (
            <img 
              src={poster.startsWith('/') ? BASE_URL + poster : poster}
              alt={title}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder.png';
                e.target.onerror = null;
              }}
            />
          )}
          <div className="anime-card-overlay" />
          
          {rating && (
            <div className="anime-card-rating">
              <span className="rating-star">★</span>
              <span className="rating-value">{rating}</span>
            </div>
          )}

          {episodes && (
            <div className="anime-card-episodes">
              {episodes + ' эп.'}
            </div>
          )}
        </div>

        <div className="anime-card-info">
          <h3 className="anime-card-title">{title}</h3>
          <div className="anime-card-meta">
            {animeYear && <span>{animeYear}</span>}
            {animeType && <span>{animeType}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(AnimeCard);
