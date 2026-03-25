import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Hero.css';

const BASE_URL = 'https://anilibria.top';

const Hero = ({ anime }) => {
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  if (!anime) return null;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const description = anime.description || '';

  const handleWatch = () => {
    if (anime.alias) {
      navigate('/anime/' + anime.alias + '/watch');
    }
  };

  const handleDetails = () => {
    if (anime.alias) {
      navigate('/anime/' + anime.alias);
    }
  };

  return (
    <section className="hero">
      <div 
        className="hero-banner"
        style={{ backgroundImage: poster ? 'url(' + (poster.startsWith('/') ? BASE_URL + poster : poster) + ')' : 'none' }}
      />
      <div className="hero-overlay" />
      
      <div className="hero-content">
        <div className="hero-layout">
          <motion.div 
            className="hero-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="hero-title">{title}</h1>
            
            {anime.name?.english && anime.name?.main && (
              <p className="hero-title-native">{anime.name.english}</p>
            )}

            <div className="hero-meta">
              {anime.year && <span>{anime.year}</span>}
              {anime.type?.value && <span>{anime.type.value}</span>}
              {anime.season?.value && (
                <div className="meta-status">
                  <span>{anime.season.value}</span>
                </div>
              )}
            </div>

            <div className="hero-genres">
              {anime.genres?.slice(0, 4).map((genre) => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
            </div>

            <p className="hero-description">
              {description?.slice(0, 100)}...
            </p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={handleWatch}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Смотреть</span>
              </button>
              <button className="hero-btn-secondary" onClick={handleDetails}>
                <HelpCircle size={18} />
                <span>Подробнее</span>
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
