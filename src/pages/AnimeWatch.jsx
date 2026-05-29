import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  ChevronLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, SkipBack, Film,
  Settings, PictureInPicture2, Subtitles, Gauge, Check
} from 'lucide-react';
import { useAnimeById } from '../hooks/useAnime';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import ErrorMessage from '../components/ErrorMessage';
import { API_URL } from '../api/config';
import './AnimeWatch.css';

const BASE_URL = 'https://anilibria.top';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const saveProgressServer = async (user, id, title, poster, episodeOrdinal, episodesTotal, genres) => {
  if (!user) return;
  try {
    await fetch(`${API_URL}/watch-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        anime_id: String(id),
        title: title || '',
        poster: poster || '',
        episode: String(episodeOrdinal),
        episodes_total: String(episodesTotal),
        genres: JSON.stringify(genres)
      })
    });
  } catch (e) { /* ignore */ }
};

const LoadingOverlay = () => (
  <div className="player-loading-overlay" />
);

const VideoPlayer = ({ episodes, currentEpisode, onEpisodeChange, title }) => {
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
  const [quality, setQuality] = useState('1080');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState(-1);
  const [isPiP, setIsPiP] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVolumeHover, setShowVolumeHover] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [showWatchOpening, setShowWatchOpening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastClickRef = useRef({ time: 0, x: 0 });
  const seekIndicatorRef = useRef(null);

  const [seekDirection, setSeekDirection] = useState(null);
  const [showSeekIndicator, setShowSeekIndicator] = useState(false);

  const showSeekFeedback = useCallback((direction) => {
    setSeekDirection(direction);
    setShowSeekIndicator(true);
    clearTimeout(seekIndicatorRef.current);
    seekIndicatorRef.current = setTimeout(() => setShowSeekIndicator(false), 600);
  }, []);

  const handlePlayerClick = useCallback((e) => {
    const now = Date.now();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const isDoubleTap = now - lastClickRef.current.time < 350 && Math.abs(e.clientX - lastClickRef.current.x) < 100;
    lastClickRef.current = { time: now, x: e.clientX };

    if (!isDoubleTap) return;

    const midX = rect.left + rect.width / 2;
    const direction = e.clientX < midX ? 'backward' : 'forward';
    const video = videoRef.current;
    if (!video) return;

    const seekAmount = 10;
    if (direction === 'backward') {
      video.currentTime = Math.max(0, video.currentTime - seekAmount);
    } else {
      video.currentTime = Math.min(duration, video.currentTime + seekAmount);
    }

    showSeekFeedback(direction);
  }, [duration, showSeekFeedback]);

  const qualityKey = `hls_${quality}`;
  const hlsUrl = currentEpisode?.[qualityKey] || currentEpisode?.hls_1080 || currentEpisode?.hls_720 || currentEpisode?.hls_480;
  const availableQualities = ['1080', '720', '480'].filter(q => currentEpisode?.[`hls_${q}`]);

  useEffect(() => {
    if (availableQualities.length > 0 && !availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [currentEpisode]);

  const opening = currentEpisode?.opening;
  const hasOpening = opening?.start > 0 && opening?.stop > opening?.start;

  const initHls = useCallback((url) => {
    const video = videoRef.current;
    if (!video || !url) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    setIsLoading(true);
    setError(null);
    video.removeAttribute('src');
    video.load();
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setActiveSubtitleTrack(-1);
        setSubtitleTracks([]);
        const v = videoRef.current;
        if (v && !v.paused) v.play().catch(() => {});
      });
      hls.on(Hls.Events.SUBtitle_TRACKS_UPDATED, () => {
        const tracks = hls.subtitleTracks || [];
        setSubtitleTracks(tracks);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) { setError('Ошибка загрузки видео'); setIsLoading(false); }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        const v = videoRef.current;
        if (v && !v.paused) v.play().catch(() => {});
      }, { once: true });
    } else {
      setError('Ваш браузер не поддерживает HLS');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hlsUrl) { setIsLoading(false); return; }
    initHls(hlsUrl);
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [hlsUrl, initHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
      if (hasOpening && video.currentTime >= opening.start && video.currentTime < opening.stop) {
        setShowWatchOpening(true);
      } else {
        setShowWatchOpening(false);
        setShowSkip(false);
      }
    };
    const onDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      const next = (currentEpisode?.ordinal || 1) + 1;
      if (episodes.some(e => e.ordinal === next)) onEpisodeChange(next);
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
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
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

  const seekTo = useCallback((clientX) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress || duration <= 0) return;
    const rect = progress.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setHoverTime(pos * duration);
    setHoverX(clientX - rect.left);
  }, [duration]);

  const handleSeek = (e) => seekTo(e.clientX);

  const handleSeekStart = (e) => {
    setIsDragging(true);
    seekTo(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => { e.preventDefault(); seekTo(e.clientX); };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, seekTo]);

  const handleProgressHover = (e) => {
    const progress = progressRef.current;
    if (!progress || duration <= 0) return;
    const rect = progress.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleSubtitleSelect = useCallback((index) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.subtitleTrack = index;
    setActiveSubtitleTrack(index);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (!showSettings) return;
    const handler = (e) => {
      if (!e.target.closest('.settings-menu') && !e.target.closest('.settings-btn')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (e) {
      /* PiP not supported */
    }
  }, []);

  useEffect(() => {
    const handlePiP = () => setIsPiP(!!document.pictureInPictureElement);
    document.addEventListener('enterpictureinpicture', handlePiP);
    document.addEventListener('leavepictureinpicture', handlePiP);
    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiP);
      document.removeEventListener('leavepictureinpicture', handlePiP);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) await container.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  const skipNow = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasOpening) return;
    video.currentTime = opening.stop;
    setShowSkip(false);
    setShowWatchOpening(false);
  }, [hasOpening, opening]);

  const skipForward85 = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 85, duration);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    if (isPlaying) controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const video = videoRef.current;
      if (!video) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); showSeekFeedback('backward'); break;
        case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(duration, video.currentTime + 10); showSeekFeedback('forward'); break;
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
        case 'KeyF': e.preventDefault(); toggleFullscreen(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'Period': e.preventDefault(); skipNow(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, duration, skipNow]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayPercent = isDragging && hoverTime !== null ? (hoverTime / duration) * 100 : progressPercent;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const episodeNum = currentEpisode?.ordinal || 1;
  const totalEpisodes = episodes?.length || 0;

  return (
    <div
      className={`video-player-wrapper ${isFullscreen ? 'fullscreen' : ''} ${!showControls && isFullscreen ? 'hide-cursor' : ''}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handlePlayerClick}
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
        <video ref={videoRef} className="player-video" onClick={togglePlay} playsInline preload="metadata" />
      )}

      <div className={`seek-indicator ${showSeekIndicator ? 'visible' : ''}`}>
        <div className={`seek-half ${seekDirection === 'backward' ? 'active' : ''}`}>
          <SkipBack size={20} />
          <span className="seek-label">10</span>
        </div>
        <div className={`seek-half ${seekDirection === 'forward' ? 'active' : ''}`}>
          <SkipForward size={20} />
          <span className="seek-label">10</span>
        </div>
      </div>

      {isLoading && hlsUrl && <LoadingOverlay />}

      {currentEpisode && (
        <div className={`player-controls-overlay ${showControls || !isPlaying ? 'visible' : ''}`}>
          <div className="controls-gradient" />

          <div className="controls-top">
            <div className="controls-top-row">
              <div className="episode-badge">
                <span className="episode-badge-title">{title}</span>
                <span className="episode-badge-sub">
                  Серия {episodeNum}{currentEpisode.name ? ` — ${currentEpisode.name}` : ''}
                </span>
              </div>
              <button className="pip-btn" onClick={togglePiP} title={isPiP ? 'Закрыть PiP' : 'Картинка в картинке'}>
                <PictureInPicture2 size={16} />
              </button>
            </div>
          </div>

          <div className="controls-center">
            <button className="play-btn-large" onClick={togglePlay}>
              <div className="play-icon-wrap">
                <Play size={26} className={`play-icon ${isPlaying ? 'hidden' : ''}`} />
                <Pause size={26} className={`pause-icon ${isPlaying ? '' : 'hidden'}`} />
              </div>
            </button>
          </div>

          <div className="controls-bottom">
            {(showWatchOpening || showSkip) && (
              <div className="skip-controls">
                {showWatchOpening && (
                  <button className="watch-opening-button" onClick={() => {
                    setShowWatchOpening(false);
                    setShowSkip(true);
                  }}>
                    Смотреть опенинг
                  </button>
                )}
                {showSkip && (
                  <button className="skip-opening-button" onClick={skipNow}>
                    <SkipForward size={16} />
                    <span>Пропустить</span>
                  </button>
                )}
              </div>
            )}

            <div
              className={`progress-bar ${isDragging ? 'dragging' : ''}`}
              ref={progressRef}
              onMouseDown={handleSeekStart}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => !isDragging && setHoverTime(null)}
            >
              <div className="progress-buffered" style={{ width: `${bufferedPercent}%` }} />
              <div className="progress-played" style={{ width: `${displayPercent}%` }} />
              <div className="progress-thumb" style={{ left: `${displayPercent}%` }} />
              {(hoverTime !== null || isDragging) && (
                <div className="progress-tooltip" style={{ left: `${hoverX}px` }}>
                  <span className="tooltip-time">{formatTime(hoverTime || currentTime)}</span>
                </div>
              )}
            </div>

            <div className="controls-row">
              <div className="controls-left">
                <button
                  className="ctrl-btn"
                  onClick={() => onEpisodeChange(episodeNum - 1)}
                  disabled={episodeNum <= 1}
                  title="Предыдущая серия"
                >
                  <SkipBack size={16} />
                </button>
                <button className="ctrl-btn" onClick={togglePlay}>
                  <div className="play-icon-wrap small">
                    <Play size={16} className={`play-icon ${isPlaying ? 'hidden' : ''}`} />
                    <Pause size={16} className={`pause-icon ${isPlaying ? '' : 'hidden'}`} />
                  </div>
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => onEpisodeChange(episodeNum + 1)}
                  disabled={episodeNum >= totalEpisodes}
                  title="Следующая серия"
                >
                  <SkipForward size={16} />
                </button>
                <div
                  className="volume-control"
                  onMouseEnter={() => setShowVolumeHover(true)}
                  onMouseLeave={() => setShowVolumeHover(false)}
                >
                  <button className="ctrl-btn" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <div className={`volume-slider-wrap ${showVolumeHover ? 'visible' : ''}`}>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-range"
                      style={{ '--volume-pct': `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right">
                <div className="settings-wrapper">
                  <button
                    className="ctrl-btn settings-btn"
                    onClick={() => { setShowSettings(!showSettings); setSettingsTab(null); }}
                  >
                    <Settings size={16} />
                  </button>
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        className="settings-menu"
                        initial={{ opacity: 0, scale: 0.92, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 6 }}
                        transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={e => e.stopPropagation()}
                      >
                      <AnimatePresence mode="wait">
                        {settingsTab === 'speed' && (
                          <motion.div
                            key="speed"
                            className="settings-submenu"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                          >
                            <button className="settings-back" onClick={() => setSettingsTab(null)}>
                              <ChevronLeft size={14} /> Скорость
                            </button>
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                              <button
                                key={s}
                                className={`settings-option ${playbackSpeed === s ? 'active' : ''}`}
                                onClick={() => { setPlaybackSpeed(s); setShowSettings(false); }}
                              >
                                {playbackSpeed === s && <Check size={14} />}
                                <span>{s}x</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                        {settingsTab === 'quality' && (
                          <motion.div
                            key="quality"
                            className="settings-submenu"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                          >
                            <button className="settings-back" onClick={() => setSettingsTab(null)}>
                              <ChevronLeft size={14} /> Качество
                            </button>
                            {availableQualities.map(q => (
                              <button
                                key={q}
                                className={`settings-option ${quality === q ? 'active' : ''}`}
                                onClick={() => { setQuality(q); setShowSettings(false); }}
                              >
                                {quality === q && <Check size={14} />}
                                <span>{q}p</span>
                                <span className="settings-value">
                                  {q === '1080' ? 'Высокое' : q === '720' ? 'Среднее' : 'Низкое'}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                        {settingsTab === 'subtitles' && (
                          <motion.div
                            key="subtitles"
                            className="settings-submenu"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                          >
                            <button className="settings-back" onClick={() => setSettingsTab(null)}>
                              <ChevronLeft size={14} /> Субтитры
                            </button>
                            {subtitleTracks.length > 0 ? (
                              <>
                                <button
                                  className={`settings-option ${activeSubtitleTrack === -1 ? 'active' : ''}`}
                                  onClick={() => handleSubtitleSelect(-1)}
                                >
                                  {activeSubtitleTrack === -1 && <Check size={14} />}
                                  <span>Выкл</span>
                                </button>
                                {subtitleTracks.map((track, idx) => (
                                  <button
                                    key={track.id || idx}
                                    className={`settings-option ${activeSubtitleTrack === idx ? 'active' : ''}`}
                                    onClick={() => handleSubtitleSelect(idx)}
                                  >
                                    {activeSubtitleTrack === idx && <Check size={14} />}
                                    <span>{track.name || `Subtitle ${idx + 1}`}</span>
                                  </button>
                                ))}
                              </>
                            ) : (
                              <div className="settings-empty">Субтитры недоступны</div>
                            )}
                          </motion.div>
                        )}
                        {settingsTab === null && (
                          <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                          >
                            <button className="settings-option" onClick={() => setSettingsTab('speed')}>
                              <Gauge size={14} />
                              <span>Скорость</span>
                              <span className="settings-value">{playbackSpeed}x</span>
                            </button>
                            <button className="settings-option" onClick={() => setSettingsTab('quality')}>
                              <Film size={14} />
                              <span>Качество</span>
                              <span className="settings-value">{quality}p</span>
                            </button>
                            <button className="settings-option" onClick={() => setSettingsTab('subtitles')}>
                              <Subtitles size={14} />
                              <span>Субтитры</span>
                              <span className="settings-value">
                                {activeSubtitleTrack >= 0 && subtitleTracks[activeSubtitleTrack]
                                  ? (subtitleTracks[activeSubtitleTrack].name || `#${activeSubtitleTrack + 1}`)
                                  : 'Выкл'}
                              </span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
                <button className="ctrl-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
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
        <div className="episode-thumb-placeholder"><Film size={20} /></div>
      )}
      <div className="episode-thumb-overlay"><Play size={18} /></div>
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
  const { user, loading: authLoading } = useAuth();
  const { data: anime, isLoading, error, refetch } = useAnimeById(id);
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const episodesListRef = useRef(null);
  const playerContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [authLoading, user]);

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

  useEffect(() => { setCurrentEpisodeIdx(0); }, [id]);

  useEffect(() => {
    if (authLoading || isLoading) return;
    const player = playerContainerRef.current;
    const sidebar = sidebarRef.current;
    if (!player || !sidebar) return;

    const syncHeight = () => {
      sidebar.style.maxHeight = player.offsetHeight + 'px';
    };

    syncHeight();
    observerRef.current = new ResizeObserver(syncHeight);
    observerRef.current.observe(player);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [authLoading, isLoading, id]);

  const saveRef = useRef({ id, title, poster, episodesTotal, genres: [] });
  useEffect(() => {
    saveRef.current = {
      id, title, poster, episodesTotal,
      genres: anime?.genres?.map(g => g.name) || []
    };
  });

  useEffect(() => {
    if (!currentEpisode) return;
    const { id, title, poster, episodesTotal, genres } = saveRef.current;
    saveProgressServer(user, id, title, poster, currentEpisode.ordinal, episodesTotal, genres);
  }, [currentEpisode?.ordinal, user]);

  useEffect(() => {
    if (!currentEpisode) return;
    const interval = setInterval(() => {
      const { id, title, poster, episodesTotal, genres } = saveRef.current;
      saveProgressServer(user, id, title, poster, currentEpisode.ordinal, episodesTotal, genres);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentEpisode?.ordinal, user]);

  if (authLoading || isLoading) {
    return (
      <div className="anime-watch">
        <div className="watch-layout">
          <div className="watch-main">
            <div className="skeleton-player" />
          </div>
          <aside className="watch-sidebar">
            <div className="sidebar-header">
              <div className="skeleton-sidebar-title" />
            </div>
            <div className="skeleton-sidebar-list">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-episode" />
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }
  if (error) return <ErrorMessage message={error} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const description = anime.description || '';
  const genreNames = anime.genres?.map(g => g.name) || [];

  return (
    <motion.div className="anime-watch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="watch-layout">
        <div className="watch-main" ref={playerContainerRef}>
          <VideoPlayer
            episodes={sortedEpisodes}
            currentEpisode={currentEpisode}
            onEpisodeChange={handleEpisodeChange}
            title={title}
          />
        </div>

        <motion.aside
          className="watch-sidebar"
          ref={sidebarRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <Film size={15} />
              <span>Эпизоды</span>
              <span className="sidebar-count">{sortedEpisodes.length}</span>
            </h2>
          </div>
          <div className="sidebar-episodes" ref={episodesListRef}>
            {sortedEpisodes.length > 0 ? (
              sortedEpisodes.map((ep, idx) => (
                <div key={ep.id} data-episode={ep.ordinal}>
                  <EpisodeItem
                    episode={ep} episodeNum={idx + 1}
                    isActive={idx === currentEpisodeIdx}
                    onClick={() => setCurrentEpisodeIdx(idx)}
                  />
                </div>
              ))
            ) : (
              <div className="no-episodes"><Film size={32} /><p>Эпизоды пока не добавлены</p></div>
            )}
          </div>
        </motion.aside>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => navigate('/anime/' + id)} />
    </motion.div>
  );
};

export default AnimeWatch;
