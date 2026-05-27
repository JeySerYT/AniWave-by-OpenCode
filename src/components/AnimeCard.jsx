import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AnimeCard.css';

const BASE_URL = 'https://anilibria.top';

const AnimeCard = ({ anime, index = 0 }) => {
  if (!anime) return null;
  
  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const rating = anime?.averageScore ? (anime.averageScore / 10).toFixed(1) : anime?.rating || anime?.score || null;
  const episodes = anime.episodes_total;
  const animeCode = anime.alias || anime.id;
  const genres = anime.genres?.slice(0, 2).map(g => g.name).join(', ');

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
                e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="14">No Image</text></svg>'
                );
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
            {genres && <span>{genres}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(AnimeCard);
