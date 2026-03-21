import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useTrendingAnime, usePopularAnime, useSeasonalAnime } from '../hooks/useAnime';
import { useLanguage } from '../context/LanguageContext';
import { translateMultipleToRussian } from '../utils/translation';
import './Home.css';

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
}

const Home = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const currentSeason = getCurrentSeason();
  const currentYear = new Date().getFullYear();

  const [translatedTitles, setTranslatedTitles] = useState({});

  const titles = {
    popular: t('popular') || 'Популярное',
    trending: t('trending') || 'Сейчас в тренде',
    seasonal: t('seasonal') || 'Сезонное',
  };
  
  const { data: trendingData, loading: trendingLoading, error: trendingError, refetch: refetchTrending } = useTrendingAnime();
  const { data: popularData, loading: popularLoading, error: popularError, refetch: refetchPopular } = usePopularAnime();
  const { data: seasonalData, loading: seasonalLoading, error: seasonalError, refetch: refetchSeasonal } = useSeasonalAnime(currentSeason, currentYear);

  const trendingAnime = trendingData?.Page?.media || [];
  const popularAnime = popularData?.Page?.media || [];
  const seasonalAnime = seasonalData?.Page?.media || [];
  const topAnime = trendingAnime[0];

  useEffect(() => {
    const allAnime = [...trendingAnime, ...popularAnime, ...seasonalAnime];
    if (allAnime.length === 0 || language !== 'ru') return;

    const titlesToTranslate = allAnime.map(anime => [
      anime.id,
      anime.title?.english || anime.title?.romaji || ''
    ]).filter(([_, title]) => title);

    if (titlesToTranslate.length === 0) return;

    translateMultipleToRussian(titlesToTranslate).then(results => {
      setTranslatedTitles(results);
    });
  }, [trendingData, popularData, seasonalData, language]);

  const getTranslatedTitle = (anime) => {
    if (language !== 'ru') return null;
    return translatedTitles[anime.id] || null;
  };

  const handleNavigate = (filter) => {
    navigate(`/search?${filter}`);
  };

  const renderSection = (title, animeList, loading, error, onRetry, filter) => (
    <section className="home-section">
      <h2 className="section-title">{title}</h2>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error.message} onRetry={onRetry} />}
      {!loading && !error && (
        <>
          <div className="anime-grid">
            {animeList.slice(0, 6).map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} index={index} translatedTitle={getTranslatedTitle(anime)} />
            ))}
          </div>
          <div className="section-nav">
            <button className="nav-btn" onClick={() => handleNavigate(filter)}>
              {t('showAll')}
            </button>
          </div>
        </>
      )}
    </section>
  );

  return (
    <div className="home">
      {trendingLoading ? (
        <LoadingSpinner />
      ) : trendingError ? (
        <ErrorMessage message={trendingError.message} onRetry={() => refetchTrending()} />
      ) : (
        <Hero anime={topAnime} />
      )}
      
      <div className="home-content">
        {renderSection(titles.popular, popularAnime, popularLoading, popularError, refetchPopular, 'sort=POPULARITY')}
        {renderSection(titles.trending, trendingAnime, trendingLoading, trendingError, refetchTrending, 'sort=TRENDING')}
        {renderSection(titles.seasonal, seasonalAnime, seasonalLoading, seasonalError, refetchSeasonal, `season=${currentSeason}`)}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
