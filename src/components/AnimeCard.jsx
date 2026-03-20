import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AnimeCard.css';

const AnimeCard = ({ anime, index = 0 }) => {
  const title = anime.title?.english || anime.title?.romaji || 'Unknown';
  const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
  const rating = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <motion.div
      className="anime-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
    >
      <Link to={`/anime/${anime.id}`} className="anime-card-link">
        <div className="anime-card-image">
          {coverImage && (
            <img 
              src={coverImage} 
              alt={title}
              loading="lazy"
            />
          )}
          <div className="anime-card-overlay" />
          
          {rating && (
            <div className="anime-card-rating">
              <span className="rating-star">★</span>
              <span className="rating-value">{rating}</span>
            </div>
          )}

          {anime.episodes && (
            <div className="anime-card-episodes">
              {anime.episodes} эп.
            </div>
          )}
        </div>

        <div className="anime-card-content">
          <h3 className="anime-card-title">{title}</h3>
          
          {anime.genres && anime.genres.length > 0 && (
            <div className="anime-card-genres">
              {anime.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
