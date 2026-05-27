import { useState, useEffect, useMemo } from 'react';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import { useTrendingAnime, useOngoingAnime, useSeasonalAnime, useRecentlyReleased } from '../hooks/useAnime';
import { anilibriaApi } from '../api/anilibria';
import './Home.css';

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

const Home = () => {
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();

  const [visibleCounts, setVisibleCounts] = useState({ best: 6, seasonal: 6, ongoing: 6, recent: 6 });
  const [continueWatching, setContinueWatching] = useState([]);

  const { data: bestAnime, isLoading: bestLoading, error: bestError, refetch: refetchBest } = useTrendingAnime();
  const { data: seasonalAnime, isLoading: seasonalLoading, error: seasonalError } = useSeasonalAnime(currentYear, currentSeason);
  const { data: ongoingAnime, isLoading: ongoingLoading, error: ongoingError } = useOngoingAnime();
  const { data: recentAnime, isLoading: recentLoading, error: recentError } = useRecentlyReleased();

  const handleRetry = () => refetchBest();

  const topAnime = useMemo(() => {
    if (!bestAnime) return null;
    return [...bestAnime].sort((a, b) =>
      (b.added_in_watching_collection || 0) - (a.added_in_watching_collection || 0)
    )[0];
  }, [bestAnime]);
  const { data: topAnimeFull } = useQuery({
    queryKey: ['release', topAnime?.id],
    queryFn: () => anilibriaApi.getReleaseById(topAnime?.id),
    enabled: !!topAnime?.id,
  });
  const hlsUrl = topAnimeFull?.episodes?.[0]?.hls_720 || topAnimeFull?.episodes?.[0]?.hls_480 || null;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('continue_watching') || '[]');
      setContinueWatching(saved);
    } catch (e) { /* ignore */ }
  }, []);

  const handleLoadMore = (section) => {
    setVisibleCounts(prev => ({ ...prev, [section]: (prev[section] || 6) + 6 }));
  };

  const totalWatching = useMemo(() => {
    if (!bestAnime) return 0;
    return bestAnime.slice(0, 6).reduce((sum, a) => sum + (a.added_in_watching_collection || 0), 0);
  }, [bestAnime]);

  const renderSection = (key, title, subtitle, data, loading, error) => {
    const count = visibleCounts[key] || 6;

    return (
      <section className="home-section" key={key}>
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">
              {title}
              {key === 'best' && totalWatching > 0 && (
                <span className="section-watching">
                  <span className="watching-dot" />
                  {totalWatching.toLocaleString()} смотрят
                </span>
              )}
            </h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}
        {!loading && !error && (
          <>
            <div className="anime-grid">
              {data?.slice(0, count).map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} />
              ))}
            </div>
            {data?.length > count && (
              <div className="section-nav">
                <button className="nav-btn" onClick={() => handleLoadMore(key)}>
                  Показать ещё
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  return (
    <div className="home">
      {bestLoading ? (
        <div className="home-hero-skeleton" />
      ) : bestError ? (
        <ErrorMessage message={bestError} onRetry={handleRetry} />
      ) : (
        <Hero anime={topAnime} hlsUrl={hlsUrl} />
      )}

      <div className="home-content">
        {continueWatching.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Продолжить просмотр</h2>
                <p className="section-subtitle">Вернись к тому, на чём остановился</p>
              </div>
            </div>
            <div className="anime-grid">
              {continueWatching.slice(0, 6).map((item, i) => (
                <AnimeCard key={item.id} anime={{
                  id: item.id,
                  name: { main: item.title },
                  poster: { optimized: { src: item.poster }, preview: item.poster, src: item.poster },
                  episodes_total: item.episodes_total,
                  genres: item.genres || []
                }} index={i} brief={`${item.progress || 1} эп.`} />
              ))}
            </div>
          </section>
        )}

        {renderSection('best', 'Лучшие аниме', 'Популярное сейчас', bestAnime, bestLoading, bestError)}
        {renderSection('ongoing', 'Онгоинги', 'Сейчас выходят', ongoingAnime, ongoingLoading, ongoingError)}
        {renderSection('seasonal', 'Сезонное', 'Текущий сезон', seasonalAnime, seasonalLoading, seasonalError)}
        {renderSection('recent', 'Недавно вышло', 'Последние релизы', recentAnime, recentLoading, recentError)}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
