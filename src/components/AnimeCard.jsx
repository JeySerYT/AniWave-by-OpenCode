import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './AnimeCard.css';

const BASE_URL = 'https://anilibria.top';

const truncateToWords = (text, maxWords = 18) => {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

const AnimeCard = ({ anime, index = 0, brief }) => {
  if (!anime) return null;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const description = anime.description || '';
  const genres = anime.genres || [];
  const episodes = anime.episodes_total;
  const animeCode = anime.id;

  const allGenreNames = useMemo(() => genres.map(g => g.name || g), [genres]);
  const genreNames = allGenreNames.slice(0, 3);
  const genreOverflow = allGenreNames.length - 3;
  const truncatedDesc = useMemo(
    () => description ? truncateToWords(description) : '',
    [description]
  );

  return (
    <div className="anime-card">
      <Link to={'/anime/' + animeCode} className="anime-card-link">
        <div className="anime-card-poster-wrap">
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
          {brief && (
            <div className="anime-card-brief">{brief}</div>
          )}

          <div className="anime-card-overlay" />

          <div className="anime-card-hover-content">
            <div className="anime-card-hover-title">{title}</div>
            {truncatedDesc && (
              <div className="anime-card-hover-desc">{truncatedDesc}</div>
            )}
            {genreNames.length > 0 && (
              <div className="anime-card-hover-genres">
                {genreNames.map((name, i) => (
                  <span key={i} className="anime-card-hover-genre">{name}</span>
                ))}
                {genreOverflow > 0 && (
                  <span className="anime-card-hover-genre-overflow">+{genreOverflow}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="anime-card-body">
          <h3 className="anime-card-title">{title}</h3>
          {episodes && (
            <div className="anime-card-episodes">{episodes} эп.</div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default memo(AnimeCard);
