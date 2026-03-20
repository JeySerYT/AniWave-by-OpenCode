import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import './Hero.css';

const translateToRussian = async (text) => {
  if (!text) return '';
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text.substring(0, 300))}`
    );
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (e) {
    console.log('Translation error:', e);
    return text;
  }
};

const genreTranslations = {
  'Action': 'Боевик',
  'Adventure': 'Приключения',
  'Comedy': 'Комедия',
  'Drama': 'Драма',
  'Fantasy': 'Фэнтези',
  'Horror': 'Ужасы',
  'Mystery': 'Детектив',
  'Romance': 'Романтика',
  'Sci-Fi': 'Научная фантастика',
  'Slice of Life': 'Повседневность',
  'Sports': 'Спорт',
  'Supernatural': 'Сверхъестественное',
  'Thriller': 'Триллер',
  'Ecchi': 'Этти',
  'Mecha': 'Меха',
  'Music': 'Музыка',
  'Psychological': 'Психология',
  'Shounen': 'Сёнен',
  'Shoujo': 'Сёдзё',
  'Seinen': 'Сэйнен',
  'Isekai': 'Исекай',
  'Mahou Shoujo': 'Махо-сёдзё',
  'Gore': 'Гор',
  'Yaoi': 'Яой',
  'Yuri': 'Юри',
  'Harem': 'Гарем',
  'School': 'Школа',
  'Space': 'Космос',
  'Military': 'Военное',
  'Martial Arts': 'Боевые искусства',
  'Samurai': 'Самураи',
  'Cars': 'Гонки',
  'Game': 'Игры',
  'Demons': 'Демоны',
  'Vampire': 'Вампиры',
};

const statusTranslations = {
  'FINISHED': 'Завершено',
  'RELEASING': 'Сейчас выходит',
  'NOT_YET_RELEASED': 'Не выпущено',
  'CANCELLED': 'Отменено',
  'HIATUS': 'На паузе',
  'Finished': 'Завершено',
  'Airing': 'Сейчас выходит',
  'Not Yet Released': 'Не выпущено',
  'Cancelled': 'Отменено',
  'On Hiatus': 'На паузе',
};

const translateGenre = (genre) => {
  return genreTranslations[genre] || genre;
};

const Hero = ({ anime }) => {
  const navigate = useNavigate();
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedDesc, setTranslatedDesc] = useState('');

  useEffect(() => {
    if (!anime) return;
    
    const englishTitle = anime.title?.english || anime.title?.romaji || '';
    const englishDesc = anime.description?.replace(/<[^>]*>/g, '') || '';
    
    setTranslatedTitle(englishTitle);
    setTranslatedDesc(englishDesc);
    
    translateToRussian(englishTitle).then(translated => {
      if (translated !== englishTitle) {
        setTranslatedTitle(translated);
      }
    });
    
    translateToRussian(englishDesc).then(translated => {
      if (translated !== englishDesc) {
        setTranslatedDesc(translated);
      }
    });
  }, [anime]);

  if (!anime) return null;

  const title = anime.title?.english || anime.title?.romaji || 'Unknown';
  const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
  const bannerImage = anime.bannerImage || anime.coverImage?.extraLarge || coverImage;

  const trailerUrl = anime.trailer?.site === 'youtube' && anime.trailer?.id
    ? `https://www.youtube.com/embed/${anime.trailer.id}?autoplay=1&mute=1&loop=1&playlist=${anime.trailer.id}&controls=0&showinfo=0&modestbranding=1`
    : null;

  const handleWatchTrailer = () => {
    if (anime.trailer?.site === 'youtube' && anime.trailer?.id) {
      window.open(`https://www.youtube.com/watch?v=${anime.trailer.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDetails = () => {
    navigate(`/anime/${anime.id}`);
  };

  const formatStatus = (status) => {
    return statusTranslations[status] || status;
  };

  return (
    <section className="hero">
      {trailerUrl ? (
        <div className="hero-video-container">
          <iframe
            className="hero-video"
            src={trailerUrl}
            title={title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div 
          className="hero-banner"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />
      )}
      <div className="hero-overlay" />
      
      <div className="hero-content">
        <div className="hero-layout">
          <motion.div 
            className="hero-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="hero-title">{translatedTitle || title}</h1>
            
            {anime.title?.romaji && anime.title?.english && (
              <p className="hero-title-native">{anime.title.romaji}</p>
            )}

            <div className="hero-meta">
              {anime.status && (
                <div className="meta-status">
                  <span>{formatStatus(anime.status)}</span>
                </div>
              )}
            </div>

            <div className="hero-genres">
              {anime.genres?.slice(0, 4).map((genre) => (
                <span key={genre} className="genre-tag">{translateGenre(genre)}</span>
              ))}
            </div>

            <p className="hero-description">
              {(translatedDesc || anime.description?.replace(/<[^>]*>/g, ''))?.slice(0, 100)}...
            </p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={handleDetails}>
                <HelpCircle size={18} />
                <span>Подробнее</span>
              </button>
              <button className="hero-btn-secondary" onClick={handleWatchTrailer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Трейлер</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="hero-poster-wrap"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="hero-poster">
              <img src={coverImage} alt={title} />
              {anime.averageScore && (
                <div className="poster-rating">
                  <span className="star">★</span>
                  <span className="score">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="hero-decoration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="deco-line" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
