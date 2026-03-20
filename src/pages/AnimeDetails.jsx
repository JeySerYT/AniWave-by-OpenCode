import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useAnimeById } from '../hooks/useAnime';
import { useFavorites } from '../hooks/useFavorites';
import './AnimeDetails.css';

const translateToRussian = async (text) => {
  if (!text) return '';
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (e) {
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

const translateGenre = (genre) => {
  return genreTranslations[genre] || genre;
};

const AnimeDetails = () => {
  const { id } = useParams();
  const { data, loading, error, refetch } = useAnimeById(parseInt(id));
  const { isFavorite, toggleFavorite } = useFavorites();
  const [translatedTitles, setTranslatedTitles] = useState({});
  const [translatedDesc, setTranslatedDesc] = useState('');

  const anime = data?.Media;
  const favorite = isFavorite(parseInt(id));
  const relatedAnime = anime?.relations?.edges?.slice(0, 6) || [];
  const originalDescription = anime?.description?.replace(/<[^>]*>/g, '') || '';

  useEffect(() => {
    if (!anime) return;
    
    const translateContent = async () => {
      const titleToTranslate = anime.title?.english || anime.title?.romaji;
      if (titleToTranslate) {
        const titleTranslated = await translateToRussian(titleToTranslate);
        if (titleTranslated !== titleToTranslate) {
          setTranslatedTitles(prev => ({ ...prev, 'main': titleTranslated }));
        }
      }
      
      const descToTranslate = anime.description?.replace(/<[^>]*>/g, '') || '';
      if (descToTranslate) {
        const descTranslated = await translateToRussian(descToTranslate);
        setTranslatedDesc(descTranslated);
      }
    };
    
    translateContent();
  }, [anime]);

  useEffect(() => {
    if (!anime || !relatedAnime.length) return;
    
    const translateRelatedTitles = async () => {
      const newTranslations = {};
      for (const relation of relatedAnime) {
        const title = relation.node.title?.english || relation.node.title?.romaji;
        if (title && !translatedTitles[relation.node.id]) {
          const translated = await translateToRussian(title);
          newTranslations[relation.node.id] = translated;
        }
      }
      if (Object.keys(newTranslations).length > 0) {
        setTranslatedTitles(prev => ({ ...prev, ...newTranslations }));
      }
    };
    
    translateRelatedTitles();
  }, [anime, relatedAnime.length]);

  const getTranslatedAnime = (anime) => {
    const translated = translatedTitles[anime.id];
    return {
      ...anime,
      title: {
        ...anime.title,
        english: translated || anime.title?.english || anime.title?.romaji,
        romaji: translated || anime.title?.english || anime.title?.romaji
      }
    };
  };

  const translations = {
    status: {
      FINISHED: 'Завершено',
      RELEASING: 'Сейчас выходит',
      NOT_YET_RELEASED: 'Не выпущено',
      CANCELLED: 'Отменено',
      HIATUS: 'На паузе'
    },
    format: {
      TV: 'ТВ',
      TV_SHORT: 'ТВ (короткий)',
      MOVIE: 'Фильм',
      SPECIAL: 'Спешл',
      OVA: 'ОВА',
      ONA: 'ОВА (веб)',
      MUSIC: 'Музыка',
      MANGA: 'Манга',
      NOVEL: 'Ранобэ',
      ONE_SHOT: 'Ваншот'
    },
    source: {
      ORIGINAL: 'Оригинал',
      MANGA: 'Манга',
      LIGHT_NOVEL: 'Ранобэ',
      VISUAL_NOVEL: 'Вижуал Новелла',
      VIDEO_GAME: 'Видеоигра',
      OTHER: 'Другое',
      NOVEL: 'Ранобэ',
      DOUJIN: 'Додзинси',
      ANIME: 'Аниме'
    },
    season: {
      WINTER: 'Зима',
      SPRING: 'Весна',
      SUMMER: 'Лето',
      FALL: 'Осень'
    },
    country: {
      JP: 'Япония',
      KR: 'Корея',
      CN: 'Китай',
      US: 'США'
    },
    role: {
      MAIN: 'Главный',
      SUPPORTING: 'Второстепенный',
      BACKGROUND: 'Эпизодический'
    }
  };

  const translate = (type, value) => {
    if (!value) return null;
    return translations[type]?.[value] || value;
  };

  const formatDate = (date) => {
    if (!date?.year) return null;
    if (date.month && date.day) {
      return `${date.day}.${date.month}.${date.year}`;
    }
    return date.year;
  };

  const formatAiringDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWatchTrailer = () => {
    if (anime?.trailer?.site === 'youtube' && anime?.trailer?.id) {
      window.open(`https://www.youtube.com/watch?v=${anime.trailer.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Аниме не найдено" />;

  const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
  const bannerImage = anime.bannerImage || coverImage;
  const displayTitle = translatedTitles['main'] || anime.title?.english || anime.title?.romaji || 'Неизвестно';
  const displayDescription = translatedDesc || originalDescription || 'Описание отсутствует';

  return (
    <div className="anime-details">
      <motion.div 
        className="details-banner" 
        style={{ backgroundImage: `url(${bannerImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
              {coverImage && <img src={coverImage} alt={displayTitle} />}
              {anime.averageScore && (
                <div className="poster-rating">
                  <span className="star">★</span>
                  <span className="score">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              <motion.button 
                className={`cover-favorite-btn ${favorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(anime)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.button>
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
                {displayTitle}
              </motion.h1>
              {anime.trailer?.id && (
                <motion.button 
                  className="trailer-icon-btn"
                  onClick={handleWatchTrailer}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="trailer-text">Трейлер</span>
                </motion.button>
              )}
            </div>
            {anime.title?.native && (
              <motion.p 
                className="details-title-native"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {anime.title.native}
              </motion.p>
            )}

            <motion.div 
              className="details-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {anime.episodes && (
                <div className="meta-item">
                  <span>{anime.episodes}</span>
                  <span className="meta-label">Серий</span>
                </div>
              )}
              {anime.status && (
                <div className="meta-item">
                  <span>{translate('status', anime.status)}</span>
                </div>
              )}
            </motion.div>

            <motion.div 
              className="details-description glass-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>{displayDescription}</p>
            </motion.div>

            <motion.div 
              className="info-panel glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {anime.genres?.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Жанры:</span>
                  <span className="info-value">{anime.genres.map(g => translateGenre(g)).join(', ')}</span>
                </div>
              )}
              {anime.season && (
                <div className="info-row">
                  <span className="info-label">Сезон:</span>
                  <span className="info-value">
                    {translate('season', anime.season)} {anime.seasonYear}
                  </span>
                </div>
              )}
              {anime.studios?.nodes?.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Студия:</span>
                  <span className="info-value studios-list">
                    {anime.studios.nodes.map(s => s.name).join(', ')}
                  </span>
                </div>
              )}
              {anime.source && (
                <div className="info-row">
                  <span className="info-label">Источник:</span>
                  <span className="info-value">{translate('source', anime.source)}</span>
                </div>
              )}
              {anime.countryOfOrigin && (
                <div className="info-row">
                  <span className="info-label">Страна:</span>
                  <span className="info-value">{translate('country', anime.countryOfOrigin)}</span>
                </div>
              )}
              {anime.startDate?.year && (
                <div className="info-row">
                  <span className="info-label">Дата выхода:</span>
                  <span className="info-value">
                    {formatDate(anime.startDate)}
                    {anime.endDate?.year && anime.endDate.year !== anime.startDate.year && (
                      ` — ${formatDate(anime.endDate)}`
                    )}
                  </span>
                </div>
              )}
              {anime.nextAiringEpisode && (
                <div className="info-row highlight">
                  <span className="info-label">Следующая серия:</span>
                  <span className="info-value">
                    Серия {anime.nextAiringEpisode.episode} — {formatAiringDate(anime.nextAiringEpisode.airingAt)}
                  </span>
                </div>
              )}
              {anime.synonyms?.length > 0 && (
                <div className="info-row">
                  <span className="info-label wide">Альт. названия:</span>
                  <span className="info-value synonyms">{anime.synonyms.slice(0, 5).join(', ')}</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {relatedAnime.length > 0 && (
          <motion.section 
            className="related-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="related-title">Похожие аниме</h2>
            <div className="related-grid">
              {relatedAnime.map((relation, index) => (
                <AnimeCard 
                  key={relation.node.id} 
                  anime={getTranslatedAnime(relation.node)}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;
