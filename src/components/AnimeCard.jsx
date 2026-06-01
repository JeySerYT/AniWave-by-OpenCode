import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AnimeCard.css';

const BASE_URL = 'https://anilibria.top';

const AnimeCard = ({ anime, index = 0, brief }) => {
  if (!anime) return null;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const rating = anime?.averageScore ? (anime.averageScore / 10).toFixed(1) : anime?.rating || anime?.score || null;
  const episodes = anime.episodes_total;
  const animeCode = anime.id;
  const status = anime?.status?.string || anime?.publish_status || null;

  return (
    <motion.div
      className="anime-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
    >
      <Link to={'/anime/' + animeCode} className="anime-card-link">
        <div className="anime-card-poster">
          {poster && (
            <img
              src={poster.startsWith('/') ? BASE_URL + poster : poster}
              alt={title}
              loading="lazy"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#1a1a1a"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#555" font-size="12">Нет постера</text></svg>'
                );
                e.target.onerror = null;
              }}
            />
          )}
          <div className="anime-card-overlay" />

          {rating && (
            <div className="anime-card-badge rating-badge">
              <span className="rating-icon">★</span>
              {rating}
            </div>
          )}

          {episodes && (
            <div className="anime-card-badge episodes-badge">
              {episodes} эп.
            </div>
          )}

          {status === 'ongoing' && (
            <div className="anime-card-status ongoing">
              <span className="status-dot-live" />
              Онгоинг
            </div>
          )}

          {brief && (
            <div className="anime-card-brief">{brief}</div>
          )}
        </div>

        <div className="anime-card-body">
          <h3 className="anime-card-title">{title}</h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(AnimeCard);
