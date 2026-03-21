import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { translateToRussian } from '../utils/translation';
import { genreTranslations, statusTranslations, translateGenre, translateStatus } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';
import './Hero.css';

const Hero = ({ anime }) => {
  const { t } = useLanguage();
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
                  <span>{translateStatus(anime.status)}</span>
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
                <span>{t('details')}</span>
              </button>
              <button className="hero-btn-secondary" onClick={handleWatchTrailer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>{t('trailer')}</span>
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
