import { useState, useEffect, useMemo } from 'react';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid, SkeletonBanner } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import { useTrendingAnime, useSeasonalAnime, useRecentlyReleased, useYearAnime } from '../hooks/useAnime';
import { useAuth } from '../context/AuthContext';
import { anilibriaApi } from '../api/anilibria';
import { API_URL } from '../api/config';
import './Home.css';

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

const Home = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();

  const { addToast } = useToast();
  const [visibleCounts, setVisibleCounts] = useState({ best: 7, seasonal: 7, recent: 7 });
  const [continueWatching, setContinueWatching] = useState([]);

  const { data: bestAnime, isLoading: bestLoading, error: bestError, refetch: refetchBest } = useTrendingAnime();
  const { data: seasonalAnime, isLoading: seasonalLoading, error: seasonalError } = useSeasonalAnime(currentYear, currentSeason);
  const { data: recentAnime, isLoading: recentLoading, error: recentError } = useRecentlyReleased();
  const { data: yearAnime, isLoading: yearLoading, error: yearError } = useYearAnime(currentYear);

  useEffect(() => { if (bestError) addToast(bestError instanceof Error ? bestError.message : 'Ошибка загрузки'); }, [bestError, addToast]);
  useEffect(() => { if (seasonalError) addToast(seasonalError instanceof Error ? seasonalError.message : 'Ошибка загрузки'); }, [seasonalError, addToast]);
  useEffect(() => { if (recentError) addToast(recentError instanceof Error ? recentError.message : 'Ошибка загрузки'); }, [recentError, addToast]);
  useEffect(() => { if (yearError) addToast(yearError instanceof Error ? yearError.message : 'Ошибка загрузки'); }, [yearError, addToast]);

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

  const episodes = topAnimeFull?.episodes || [];
  const openingEp = episodes.find(e => e.opening?.start > 0 && e.opening?.stop > e.opening?.start) || episodes[0];
  const opening = openingEp?.opening || null;
  const hlsUrl = openingEp?.hls_720 || openingEp?.hls_480 || null;

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/watch-progress`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const seen = new Set();
            const deduped = [];
            for (const w of data) {
              if (!seen.has(w.anime_id)) {
                seen.add(w.anime_id);
                deduped.push({
                  id: w.anime_id,
                  title: w.title,
                  poster: w.poster,
                  progress: parseInt(w.episode) || 1,
                  episodes_total: parseInt(w.episodes_total) || 0,
                  genres: (() => { try { return JSON.parse(w.genres || '[]'); } catch { return []; } })()
                });
              }
            }
            setContinueWatching(deduped);
          }
        })
        .catch(() => {});
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('continue_watching') || '[]');
        setContinueWatching(saved);
      } catch (e) { /* ignore */ }
    }
  }, [user]);

  const handleLoadMore = (section) => {
    setVisibleCounts(prev => ({ ...prev, [section]: (prev[section] || 7) + 7 }));
  };

  const totalWatching = useMemo(() => {
    if (!bestAnime) return 0;
    return bestAnime.slice(0, 7).reduce((sum, a) => sum + (a.added_in_watching_collection || 0), 0);
  }, [bestAnime]);

  const shuffledYearAnime = useMemo(() => {
    if (!yearAnime) return [];
    const arr = [...yearAnime];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [yearAnime]);

  const renderSection = (key, title, subtitle, data, loading, error) => {
    const count = visibleCounts[key] || 7;
    const hasData = data?.length > 0;

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

        {loading && !hasData && <SkeletonGrid count={7} />}
        {hasData && (
          <>
            <div className="anime-grid">
              {data.slice(0, count).map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} />
              ))}
            </div>
            {data.length > count && (
              <div className="section-nav">
                <button className="nav-btn" onClick={() => handleLoadMore(key)}>
                  Показать ещё
                </button>
              </div>
            )}
          </>
        )}
        {!loading && !hasData && !error && (
          <p className="section-empty">Нет данных</p>
        )}
      </section>
    );
  };

  return (
    <div className="home">
      {bestLoading || bestError ? (
        <SkeletonBanner />
      ) : (
        <Hero anime={topAnime} hlsUrl={hlsUrl} opening={opening} episodes={episodes} />
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
              {continueWatching.slice(0, 7).map((item, i) => (
                <AnimeCard key={item.id} anime={{
                  id: item.id,
                  name: { main: item.title },
                  poster: { optimized: { src: item.poster }, preview: item.poster, src: item.poster },
                  episodes_total: item.episodes_total,
                  genres: (item.genres || []).map(g => typeof g === 'string' ? { name: g } : g)
                }} index={i} brief={`${item.progress || 1} эп.`} />
              ))}
            </div>
          </section>
        )}

        {renderSection('best', 'Лучшие аниме', 'Популярное сейчас', bestAnime, bestLoading, bestError)}
        {renderSection('seasonal', 'Сезонное', { winter: 'Зима', spring: 'Весна', summer: 'Лето', autumn: 'Осень' }[currentSeason] || 'Текущий сезон', seasonalAnime, seasonalLoading, seasonalError)}
        {renderSection('recent', 'Новые эпизоды', 'Последние релизы', recentAnime, recentLoading, recentError)}
        {renderSection('year', 'Вышло в этом году', String(currentYear), shuffledYearAnime, yearLoading, yearError)}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
