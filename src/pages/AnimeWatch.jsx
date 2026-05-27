import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import {
  ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, List, Grid3X3, Film
} from 'lucide-react';
import { useAnimeById } from '../hooks/useAnime';
import ErrorMessage from '../components/ErrorMessage';
import './AnimeWatch.css';

const BASE_URL = 'https://anilibria.top';
const CW_KEY = 'continue_watching';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const saveProgress = (animeId, title, poster, episodeOrdinal, episodesTotal, genres) => {
  try {
    const saved = JSON.parse(localStorage.getItem(CW_KEY) || '[]');
    const idx = saved.findIndex(i => i.id === animeId);
    const entry = { id: animeId, title, poster, progress: episodeOrdinal, episodes_total: episodesTotal, genres, updatedAt: Date.now() };
    if (idx >= 0) {
      saved[idx] = entry;
    } else {
      saved.unshift(entry);
    }
    localStorage.setItem(CW_KEY, JSON.stringify(saved.slice(0, 20)));
  } catch (e) { /* ignore */ }
};

const LoadingOverlay = () => (
  <div className="player-loading-overlay">
    <div className="loading-pulse" />
  </div>
);

const VideoPlayer = ({ episodes, currentEpisode, onEpisodeChange }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeout = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('player_volume') || '1'); } catch { return 1; }
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('720');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSkipBtn, setShowSkipBtn] = useState(false);

  const qualityKey = `hls_${quality}`;
  const hlsUrl = currentEpisode?.[qualityKey] || currentEpisode?.hls_1080 || currentEpisode?.hls_720 || currentEpisode?.hls_480;

  const opening = currentEpisode?.opening;
  const hasOpening = opening?.start > 0 && opening?.stop > opening?.start;

  const initHls = useCallback((url) => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    video.removeAttribute('src');
    video.load();

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (isPlaying) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Ошибка загрузки видео');
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (isPlaying) video.play().catch(() => {});
      }, { once: true });
    } else {
      setError('Ваш браузер не поддерживает HLS');
      setIsLoading(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!hlsUrl) {
      setIsLoading(false);
      return;
    }
    initHls(hlsUrl);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, initHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (hasOpening && video.currentTime >= opening.start && video.currentTime < opening.stop - 2) {
        setShowSkipBtn(true);
      } else {
        setShowSkipBtn(false);
      }
    };
    const onDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      const nextOrdinal = (currentEpisode?.ordinal || 1) + 1;
      if (episodes.some(e => e.ordinal === nextOrdinal)) {
        onEpisodeChange(nextOrdinal);
      }
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onSeeked = () => setIsLoading(false);
    const onStalled = () => setIsLoading(true);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('stalled', onStalled);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('stalled', onStalled);
    };
  }, [currentEpisode, hasOpening, opening, episodes, onEpisodeChange]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
    localStorage.setItem('player_volume', String(val));
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;
    const rect = progress.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
  };

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const skipOpening = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasOpening) return;
    video.currentTime = opening.stop;
    setShowSkipBtn(false);
  }, [hasOpening, opening]);

  const skipForward85 = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 85, duration);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          localStorage.setItem('player_volume', String(video.volume));
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          localStorage.setItem('player_volume', String(video.volume));
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Period':
          e.preventDefault();
          skipOpening();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, duration, skipOpening]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const episodeNum = currentEpisode?.ordinal || 1;
  const totalEpisodes = episodes?.length || 0;

  return (
    <div
      className={`video-player-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
    >
      {!hlsUrl ? (
        <div className="player-error-state">
          <Film size={48} />
          <p>Видео для этого эпизода недоступно</p>
        </div>
      ) : error ? (
        <div className="player-error-state">
          <Film size={48} />
          <p>{error}</p>
          <button className="retry-btn" onClick={() => initHls(hlsUrl)}>Повторить</button>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="player-video"
          onClick={togglePlay}
          playsInline
          preload="metadata"
        />
      )}

      {isLoading && hlsUrl && <LoadingOverlay />}

      {currentEpisode && (
        <div className={`player-controls-overlay ${showControls || !isPlaying ? 'visible' : ''}`}>
          <div className="controls-gradient" />

          <div className="controls-top">
            <div className="controls-top-left">
              <div className="episode-badge">
                <span>Серия {episodeNum}</span>
                {currentEpisode.name && <span className="episode-name"> — {currentEpisode.name}</span>}
              </div>
            </div>
            {showSkipBtn && hasOpening && (
              <button className="skip-opening-btn" onClick={skipOpening}>
                <SkipForward size={16} />
                Пропустить опенинг
              </button>
            )}
          </div>

          <div className="controls-center">
            <button className="ctrl-btn nav-btn" onClick={() => onEpisodeChange(episodeNum - 2)} disabled={episodeNum <= 1}>
              <ChevronLeft size={22} />
            </button>
            <button className="ctrl-btn play-btn-large" onClick={togglePlay}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button className="ctrl-btn nav-btn" onClick={() => onEpisodeChange(episodeNum)} disabled={episodeNum >= totalEpisodes}>
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="controls-bottom">
            <div className="progress-bar" ref={progressRef} onClick={handleSeek}>
              <div className="progress-buffered" style={{ width: `${bufferedPercent}%` }} />
              <div className="progress-played" style={{ width: `${progressPercent}%` }} />
              <div className="progress-thumb" style={{ left: `${progressPercent}%` }} />
            </div>

            <div className="controls-row">
              <div className="controls-left">
                <button className="ctrl-btn" onClick={togglePlay}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button className="ctrl-btn" onClick={skipForward85} title="Пропустить 85 сек">
                  <SkipForward size={18} />
                </button>
                <div className="volume-control">
                  <button className="ctrl-btn" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="volume-slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-range"
                    />
                  </div>
                </div>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right">
                <div className="quality-selector">
                  <button
                    className="ctrl-btn quality-btn"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                  >
                    {quality}p
                  </button>
                  {showQualityMenu && (
                    <div className="quality-menu">
                      {[
                        { label: '1080p', key: '1080' },
                        { label: '720p', key: '720' },
                        { label: '480p', key: '480' },
                      ].map(q => (
                        <button
                          key={q.key}
                          className={`quality-option ${quality === q.key ? 'active' : ''}`}
                          onClick={() => {
                            setQuality(q.key);
                            setShowQualityMenu(false);
                          }}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="ctrl-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>

            <div className="controls-hints">
              <span>Пробел — пауза</span>
              <span>← → — перемотка</span>
              <span>F — полноэкранный</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EpisodeItem = ({ episode, isActive, onClick, episodeNum }) => (
  <motion.button
    className={`episode-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    layout
  >
    <div className="episode-thumb">
      {episode.preview?.preview ? (
        <img
          src={episode.preview.preview.startsWith('/') ? BASE_URL + episode.preview.preview : episode.preview.preview}
          alt={`Эпизод ${episodeNum}`}
          loading="lazy"
        />
      ) : (
        <div className="episode-thumb-placeholder">
          <Film size={20} />
        </div>
      )}
      <div className="episode-thumb-overlay">
        <Play size={18} />
      </div>
    </div>
    <div className="episode-info">
      <span className="episode-number">Серия {episodeNum}</span>
      {episode.name && <span className="episode-title">{episode.name}</span>}
    </div>
  </motion.button>
);

const AnimeWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: anime, isLoading, error, refetch } = useAnimeById(id);
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(0);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const episodesListRef = useRef(null);

  const episodes = anime?.episodes || [];
  const sortedEpisodes = [...episodes].sort((a, b) => a.ordinal - b.ordinal);
  const currentEpisode = sortedEpisodes[currentEpisodeIdx] || null;
  const title = anime?.name?.main || anime?.name?.english || anime?.name?.alternative || 'Аниме';
  const poster = anime?.poster?.optimized?.src || anime?.poster?.preview || anime?.poster?.src;
  const episodesTotal = anime?.episodes_total || sortedEpisodes.length;

  const handleEpisodeChange = useCallback((newOrdinal) => {
    const idx = sortedEpisodes.findIndex(e => e.ordinal === newOrdinal);
    if (idx !== -1) {
      setCurrentEpisodeIdx(idx);
      setTimeout(() => {
        const btn = episodesListRef.current?.querySelector(`[data-episode="${newOrdinal}"]`);
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [sortedEpisodes]);

  useEffect(() => {
    setCurrentEpisodeIdx(0);
  }, [id]);

  const saveRef = useRef({ id, title, poster, episodesTotal, genres: [] });
  useEffect(() => {
    saveRef.current = { id, title, poster, episodesTotal, genres: anime?.genres?.map(g => g.name) || [] };
  });

  useEffect(() => {
    if (!currentEpisode) return;
    const { id, title, poster, episodesTotal, genres } = saveRef.current;
    saveProgress(id, title, poster, currentEpisode.ordinal, episodesTotal, genres);
  }, [currentEpisode?.ordinal]);

  useEffect(() => {
    if (!currentEpisode) return;
    const interval = setInterval(() => {
      const { id, title, poster, episodesTotal, genres } = saveRef.current;
      saveProgress(id, title, poster, currentEpisode.ordinal, episodesTotal, genres);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentEpisode?.ordinal]);

  if (isLoading) {
    return (
      <div className="anime-watch">
        <div className="watch-skeleton">
          <div className="skeleton-back" />
          <div className="skeleton-player" />
          <div className="skeleton-info">
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        </div>
      </div>
    );
  }
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const description = anime.description || '';
  const genreNames = anime.genres?.map(g => g.name) || [];

  return (
    <motion.div
      className="anime-watch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="watch-nav">
        <button className="watch-back-btn" onClick={() => navigate('/anime/' + id)}>
          <ChevronLeft size={20} />
          <span>Назад к аниме</span>
        </button>
      </div>

      <div className="watch-layout">
        <div className="watch-main">
          <VideoPlayer
            episodes={sortedEpisodes}
            currentEpisode={currentEpisode}
            onEpisodeChange={handleEpisodeChange}
          />

          <div className="watch-meta">
            <motion.div
              className="meta-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="meta-title-wrap">
                <h1 className="meta-title">{title}</h1>
                {currentEpisode && (
                  <span className="meta-episode">
                    Серия {currentEpisode.ordinal}
                    {currentEpisode.name && <> — {currentEpisode.name}</>}
                  </span>
                )}
              </div>
              <button
                className={`episodes-toggle ${showEpisodes ? 'active' : ''}`}
                onClick={() => setShowEpisodes(!showEpisodes)}
              >
                <List size={16} />
                <span>Список серий ({sortedEpisodes.length})</span>
              </button>
            </motion.div>

            <motion.div
              className="meta-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p>{description}</p>
            </motion.div>

            <motion.div
              className="meta-tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {genreNames.slice(0, 6).map((genre, i) => (
                <span key={i} className="genre-tag">{genre}</span>
              ))}
              {anime.type?.value && <span className="genre-tag type">{anime.type.description}</span>}
              {anime.year && <span className="genre-tag year">{anime.year}</span>}
              {anime.age_rating?.label && <span className="genre-tag age">{anime.age_rating.label}</span>}
            </motion.div>
          </div>
        </div>

        <motion.aside
          className={`watch-sidebar ${showEpisodes ? 'visible' : ''}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <Grid3X3 size={16} />
              <span>Эпизоды</span>
            </h2>
            <span className="sidebar-count">{sortedEpisodes.length}</span>
          </div>

          <div className="sidebar-episodes" ref={episodesListRef}>
            {sortedEpisodes.length > 0 ? (
              sortedEpisodes.map((ep, idx) => (
                <div key={ep.id} data-episode={ep.ordinal}>
                  <EpisodeItem
                    episode={ep}
                    episodeNum={idx + 1}
                    isActive={idx === currentEpisodeIdx}
                    onClick={() => setCurrentEpisodeIdx(idx)}
                  />
                </div>
              ))
            ) : (
              <div className="no-episodes">
                <Film size={32} />
                <p>Эпизоды пока не добавлены</p>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default AnimeWatch;
