import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Star, Play, Info } from 'lucide-react';
import Hls from 'hls.js';
import './Hero.css';

const BASE_URL = 'https://anilibria.top';

const Hero = memo(({ anime, hlsUrl, opening }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const hlsRef = useRef(null);

  const hasOpening = opening?.start > 0 && opening?.stop > opening?.start;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) hls.destroy();
      });
      return () => { hls.destroy(); hlsRef.current = null; };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }
  }, [hlsUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasOpening) return;

    const onTimeUpdate = () => {
      if (video.currentTime >= opening.stop) {
        video.currentTime = opening.start;
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    if (opening.start > 0) {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = opening.start;
      }, { once: true });
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [opening, hasOpening]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      video.volume = 0.3;
    }
  }, []);

  if (!anime) return null;

  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Unknown';
  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const description = anime.description || '';
  const rating = anime?.averageScore ? (anime.averageScore / 10).toFixed(1) : anime?.rating || anime?.score || null;
  const year = anime.season?.year || null;
  const type = anime.type?.full_string || anime.type?.string || null;

  const handleWatch = () => {
    if (anime.id) navigate('/anime/' + anime.id + '/watch');
  };

  const handleDetails = () => {
    if (anime.id) navigate('/anime/' + anime.id);
  };

  return (
    <section className="hero">
      {hlsUrl && (
        <video
          ref={videoRef}
          className="hero-video"
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
        />
      )}
      {!hlsUrl && (
        <div
          className="hero-banner"
          style={{ backgroundImage: poster ? 'url(' + (poster.startsWith('/') ? BASE_URL + poster : poster) + ')' : 'none' }}
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
            <div className="hero-badges">
              {rating && (
                <span className="badge badge-rating">
                  <Star size={12} fill="currentColor" />
                  <span>{rating}</span>
                </span>
              )}
              {type && <span className="badge badge-type">{type}</span>}
              {year && <span className="badge badge-year">{year}</span>}
            </div>

            <h1 className="hero-title">{title}</h1>

            {anime.name?.english && anime.name?.main && (
              <p className="hero-title-native">{anime.name.english}</p>
            )}

            <div className="hero-genres">
              {anime.genres?.slice(0, 4).map((genre) => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
            </div>

            <p className="hero-description">{description?.slice(0, 80)}...</p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={handleWatch}>
                <Play size={16} fill="currentColor" />
                <span>Смотреть</span>
              </button>
              <button className="hero-btn-secondary" onClick={handleDetails}>
                <Info size={16} />
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
                    e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#1a1a1a"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#555" font-size="14">\u041D\u0435\u0442 \u0444\u043E\u0442\u043E</text></svg>'
                    );
                    e.target.onerror = null;
                  }}
                />
              )}
              {hlsUrl && (
                <button
                  className="hero-mute-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Включить звук' : 'Выключить звук'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="hero-decoration">
          <div className="deco-glow" />
        </div>
      </div>
    </section>
  );
});

export default Hero;
