import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { SkeletonAnimeDetails } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import AuthModal from '../components/AuthModal';
import { useAnimeById, useFranchise, useSimilarByGenre } from '../hooks/useAnime';
import { useCollections } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import './AnimeDetails.css';

const BASE_URL = 'https://anilibria.top';

const GenreSimilar = ({ anime, id }) => {
  const genreIds = anime?.genres?.map(g => g.id) || [];
  const { data: similarByGenre, isLoading } = useSimilarByGenre(genreIds);
  const related = (similarByGenre || []).filter(r => String(r.id) !== String(id));

  if (isLoading) return null;
  if (related.length === 0) return null;

  return (
    <motion.section
      className="related-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <h2 className="related-title">Похожее по жанрам</h2>
      <div className="related-grid">
        {related.map((a, i) => (
          <AnimeCard key={a.id} anime={a} index={i} brief={a.genres?.slice(0, 3).map(g => g.name).join(', ')} />
        ))}
      </div>
    </motion.section>
  );
};

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCollMenu, setShowCollMenu] = useState(false);
  const [bannerVideoFailed, setBannerVideoFailed] = useState(false);
  const { data: anime, isLoading: loading, error, refetch } = useAnimeById(id);
  const { getCollectionType, addToCollection, updateCollectionType, removeFromCollection, refresh } = useCollections();
  const { data: franchiseData, isLoading: franchiseLoading } = useFranchise(id);
  const currentType = getCollectionType(id);
  const videoRef = useRef(null);

  const franchiseReleases = useMemo(() => {
    if (!franchiseData) return null;
    const franchises = Array.isArray(franchiseData) ? franchiseData : [franchiseData];
    const first = franchises[0];
    if (!first || !first.franchise_releases) return null;
    return first.franchise_releases
      .map(r => r.release)
      .filter(r => r && String(r.id) !== String(id))
      .slice(0, 10);
  }, [franchiseData, id]);

  const hasFranchise = franchiseReleases && franchiseReleases.length > 0;

  const handleWatch = () => {
    if (!user) {
      sessionStorage.setItem('redirect_after_login', '/anime/' + id + '/watch');
      setShowAuthModal(true);
    } else {
      navigate('/anime/' + id + '/watch');
    }
  };

  const formatSeason = (season) => {
    const map = { winter: 'Зима', spring: 'Весна', summer: 'Лето', autumn: 'Осень' };
    return map[season?.value] || season?.description || season?.value || '';
  };

  const formatStatus = (isOngoing) => isOngoing ? 'Сейчас выходит' : 'Завершено';
  const formatType = (type) => type?.description || type?.value || '';

  const bannerEp = useMemo(() => {
    if (!anime?.episodes?.length) return null;
    return anime.episodes.find(e => e.opening?.start > 0 && e.opening?.stop > e.opening?.start) || anime.episodes[0];
  }, [anime]);

  const bannerHlsUrl = bannerEp?.hls_720 || bannerEp?.hls_480 || null;
  const bannerOpening = bannerEp?.opening || null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !bannerHlsUrl) return;
    let hls = null;
    const onLoaded = () => {
      setBannerVideoFailed(false);
      if (bannerOpening?.start > 0 && bannerOpening?.stop > bannerOpening.start) {
        video.currentTime = bannerOpening.start;
      }
    };
    const onTimeUpdate = () => {
      if (bannerOpening?.start > 0 && bannerOpening?.stop > bannerOpening.start) {
        if (video.currentTime >= bannerOpening.stop) {
          video.currentTime = bannerOpening.start;
        }
      }
    };
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(bannerHlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, onLoaded);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setBannerVideoFailed(true);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = bannerHlsUrl;
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', () => setBannerVideoFailed(true), { once: true });
    } else {
      setBannerVideoFailed(true);
    }
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [bannerHlsUrl, bannerOpening]);

  useEffect(() => {
    if (!showCollMenu) return;
    const handler = (e) => {
      if (!e.target.closest('.cover-collection-wrap')) setShowCollMenu(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showCollMenu]);

  if (loading) return (
    <div className="anime-details">
      <SkeletonAnimeDetails />
      <Footer />
    </div>
  );
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const poster = anime.poster?.optimized?.src || anime.poster?.preview || anime.poster?.src;
  const title = anime.name?.main || anime.name?.english || anime.name?.alternative || 'Аниме';
  const description = anime.description || 'Описание недоступно';
  const genreNames = anime.genres?.map(g => g.name) || [];

  return (
    <div className="anime-details">
      <motion.div
        className="details-banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {bannerHlsUrl && !bannerVideoFailed ? (
          <video ref={videoRef} className="banner-video" muted autoPlay loop playsInline preload="metadata" poster={poster && (poster.startsWith('/') ? BASE_URL + poster : poster)} />
        ) : (
          <div className="banner-image" style={{ backgroundImage: poster ? 'url(' + (poster.startsWith('/') ? BASE_URL + poster : poster) + ')' : 'none' }} />
        )}
        <div className="banner-overlay" />
        <div className="banner-gradient" />
      </motion.div>

      <div className="details-content">
        <motion.div
          className="details-main"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="details-left">
            <motion.div
              className="details-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {poster && <img src={poster.startsWith('/') ? BASE_URL + poster : poster} alt={title} />}
              {anime.averageScore && (
                <div className="poster-rating">
                  <span className="star">★</span>
                  <span className="score">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              <div className="cover-collection-wrap">
                <motion.button
                  className={'cover-collection-btn' + (currentType ? ' active' : '')}
                  onClick={() => {
                    if (!user) { setShowAuthModal(true); return; }
                    setShowCollMenu(!showCollMenu);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </motion.button>
                {showCollMenu && (
                  <div className="collection-menu">
                    {[
                      { key: 'watching', label: 'Смотрю' },
                      { key: 'completed', label: 'Просмотренное' },
                      { key: 'planned', label: 'Буду смотреть' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        className={`coll-menu-item ${currentType === opt.key ? 'current' : ''}`}
                        onClick={async () => {
                          if (currentType === opt.key) {
                            setShowCollMenu(false);
                            return;
                          }
                          if (currentType) {
                            await updateCollectionType(id, opt.key);
                          } else {
                            await addToCollection(anime, opt.key);
                          }
                          setShowCollMenu(false);
                        }}
                      >
                        {opt.label}
                        {currentType === opt.key && <span className="coll-menu-check">✓</span>}
                      </button>
                    ))}
                    {currentType && (
                      <>
                        <div className="coll-menu-divider" />
                        <button className="coll-menu-item remove" onClick={async () => {
                          await removeFromCollection(id);
                          setShowCollMenu(false);
                        }}>
                          Удалить из коллекции
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="details-right">
            <div className="title-row">
              <motion.h1
                className="details-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {title}
              </motion.h1>
              <div className="trailer-wrap">
                <motion.button
                  className="trailer-icon-btn"
                  onClick={handleWatch}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="trailer-text">Смотреть</span>
                </motion.button>
              </div>
            </div>
            {anime.name?.main && anime.name?.english && anime.name?.english !== anime.name?.main && (
              <motion.p
                className="details-title-native"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {anime.name.english}
              </motion.p>
            )}

            <motion.div
              className="details-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {anime.episodes_total && (
                <div className="meta-item">
                  <span>{anime.episodes_total}</span>
                  <span className="meta-label">эп.</span>
                </div>
              )}
              <div className="meta-item">
                <span>{formatStatus(anime.is_ongoing)}</span>
              </div>
              {anime.type?.value && (
                <div className="meta-item">
                  <span>{formatType(anime.type)}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              className="details-description glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>{description}</p>
            </motion.div>

            <motion.div
              className="info-panel glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {anime.genres?.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Жанры:</span>
                  <span className="info-value">{anime.genres.map(g => g.name).join(', ')}</span>
                </div>
              )}
              {anime.season?.value && (
                <div className="info-row">
                  <span className="info-label">Сезон:</span>
                  <span className="info-value">{formatSeason(anime.season)} {anime.year}</span>
                </div>
              )}
              {anime.type?.value && (
                <div className="info-row">
                  <span className="info-label">Тип:</span>
                  <span className="info-value">{formatType(anime.type)}</span>
                </div>
              )}
              {anime.year && (
                <div className="info-row">
                  <span className="info-label">Год:</span>
                  <span className="info-value">{anime.year}</span>
                </div>
              )}
              {anime.episodes_total && (
                <div className="info-row">
                  <span className="info-label">Эпизоды:</span>
                  <span className="info-value">{anime.episodes_total}</span>
                </div>
              )}
              {anime.average_duration_of_episode && (
                <div className="info-row">
                  <span className="info-label">Длительность:</span>
                  <span className="info-value">{anime.average_duration_of_episode} мин.</span>
                </div>
              )}
              {anime.age_rating?.label && (
                <div className="info-row">
                  <span className="info-label">Возраст:</span>
                  <span className="info-value">{anime.age_rating.label}</span>
                </div>
              )}
              {anime.name?.alternative && anime.name?.alternative !== anime.name?.main && (
                <div className="info-row">
                  <span className="info-label wide">Альт. названия:</span>
                  <span className="info-value">{anime.name.alternative}</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {hasFranchise && (
          <motion.section
            className="related-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="related-title">Похожее</h2>
            <div className="related-grid">
              {franchiseReleases.map((a, i) => (
                <AnimeCard key={a.id} anime={a} index={i} brief={a.genres?.slice(0, 3).map(g => g.name).join(', ')} />
              ))}
            </div>
          </motion.section>
        )}

        {!hasFranchise && !franchiseLoading && anime && (
          <GenreSimilar anime={anime} id={id} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;