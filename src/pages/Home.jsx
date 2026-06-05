import { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Clock, Calendar, Play } from 'lucide-react';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid, SkeletonHero } from '../components/Skeleton';
import { useToast } from '../components/Toast';
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

const SECTION_ICONS = {
  best: TrendingUp,
  seasonal: Sparkles,
  recent: Clock,
  year: Calendar,
};

const SECTION_COLORS = {
  best: 'var(--accent-pink)',
  seasonal: 'var(--accent-purple)',
  recent: 'var(--accent-blue)',
  year: 'var(--accent-red)',
};

const ScrollCarousel = memo(({ children }) => {
  const scrollRef = useRef(null);

  const handleEdgeClick = useCallback((e) => {
    if (!scrollRef.current) return;
    const dir = parseInt(e.currentTarget.dataset.dir, 10);
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }, []);

  return (
    <div className="carousel-wrap">
      <button className="carousel-edge carousel-edge-left" data-dir="-1" onClick={handleEdgeClick} aria-label="Назад">
        <ChevronLeft size={32} />
      </button>
      <div className="carousel-track" ref={scrollRef}>
        {children}
      </div>
      <button className="carousel-edge carousel-edge-right" data-dir="1" onClick={handleEdgeClick} aria-label="Вперёд">
        <ChevronRight size={32} />
      </button>
    </div>
  );
});

const Section = memo(({ sectionKey, title, subtitle, data, loading, error, linkTo }) => {
  const hasData = data?.length > 0;
  const Icon = SECTION_ICONS[sectionKey] || TrendingUp;
  const color = SECTION_COLORS[sectionKey] || 'var(--accent-pink)';

  return (
    <section className="home-section">
      <div className="section-header">
        <div className="section-title-group">
          <div className="section-title-row">
            <div className="section-icon-wrap" style={{ background: color + '15', color }}>
              <Icon size={16} />
            </div>
            <h2 className="section-title">{title}</h2>
          </div>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          <Link to={linkTo || '/catalog'} className="section-see-all">
            Все
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {loading && !hasData && (
        <div className="carousel-wrap">
          <SkeletonGrid count={7} />
        </div>
      )}
      {hasData && (
        <ScrollCarousel>
          {data.map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} />
          ))}
        </ScrollCarousel>
      )}
      {!loading && !hasData && !error && (
        <p className="section-empty">Нет данных</p>
      )}
    </section>
  );
});

const Home = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();

  const { addToast } = useToast();
  const [continueWatching, setContinueWatching] = useState([]);
  const [cwLoading, setCwLoading] = useState(false);

  const { data: bestAnime, isLoading: bestLoading, error: bestError } = useTrendingAnime();
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
    if (!user) {
      setContinueWatching([]);
      setCwLoading(false);
      return;
    }
    setCwLoading(true);
    fetch(`${API_URL}/watch-progress`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setCwLoading(false);
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
                genres: (() => { try { return JSON.parse(w.genres || '[]'); } catch { return []; }; })()
              });
            }
          }
          setContinueWatching(deduped);
        }
      })
      .catch(() => { setCwLoading(false); });
  }, [user]);

  const shuffledYearAnime = useMemo(() => {
    if (!yearAnime) return [];
    const arr = [...yearAnime];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [yearAnime]);

  return (
    <div className="home">
      {bestLoading || bestError ? (
        <SkeletonHero />
      ) : (
        <Hero anime={topAnime} hlsUrl={hlsUrl} opening={opening} />
      )}

      <div className="home-content">
        {cwLoading && (
          <section className="home-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-title-row">
                  <div className="section-icon-wrap" style={{ background: 'rgba(255,64,129,0.1)', color: 'var(--accent-pink)' }}>
                    <Play size={16} />
                  </div>
                  <h2 className="section-title">Продолжить просмотр</h2>
                </div>
                <p className="section-subtitle">Вернись к тому, на чём остановился</p>
              </div>
            </div>
            <div className="carousel-wrap">
              <SkeletonGrid count={7} />
            </div>
          </section>
        )}
        {!cwLoading && continueWatching.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-title-row">
                  <div className="section-icon-wrap" style={{ background: 'rgba(255,64,129,0.1)', color: 'var(--accent-pink)' }}>
                    <Play size={16} />
                  </div>
                  <h2 className="section-title">Продолжить просмотр</h2>
                </div>
                <p className="section-subtitle">Вернись к тому, на чём остановился</p>
              </div>
            </div>
            <ScrollCarousel>
              {continueWatching.slice(0, 20).map((item, i) => (
                <AnimeCard key={item.id} anime={{
                  id: item.id,
                  name: { main: item.title },
                  poster: { optimized: { src: item.poster }, preview: item.poster, src: item.poster },
                  episodes_total: item.episodes_total,
                  genres: (item.genres || []).map(g => typeof g === 'string' ? { name: g } : g)
                }} index={i} brief={`${item.progress || 1} эп.`} />
              ))}
            </ScrollCarousel>
          </section>
        )}

        <Section
          sectionKey="best"
          title="Лучшие аниме"
          subtitle="Популярное сейчас"
          data={bestAnime}
          loading={bestLoading}
          error={bestError}
          linkTo="/catalog?category=trending"
        />
        <Section
          sectionKey="seasonal"
          title="Сезонное"
          subtitle={{
            winter: 'Зимние аниме',
            spring: 'Весенние аниме',
            summer: 'Летние аниме',
            autumn: 'Осенние аниме',
          }[currentSeason]}
          data={seasonalAnime}
          loading={seasonalLoading}
          error={seasonalError}
          linkTo="/catalog?category=seasonal"
        />
        <Section
          sectionKey="recent"
          title="Новые эпизоды"
          subtitle="Последние релизы"
          data={recentAnime}
          loading={recentLoading}
          error={recentError}
          linkTo="/catalog?category=recent"
        />
        <Section
          sectionKey="year"
          title={`Тайтлы ${currentYear} года`}
          subtitle={`Что вышло в ${currentYear} году`}
          data={shuffledYearAnime}
          loading={yearLoading}
          error={yearError}
          linkTo={`/catalog?category=year&year=${currentYear}`}
        />
      </div>
    </div>
  );
};

export default Home;
