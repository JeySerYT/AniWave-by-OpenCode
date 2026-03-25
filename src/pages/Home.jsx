import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useTrendingAnime, useOngoingAnime, useSeasonalAnime, useRecentlyReleased } from '../hooks/useAnime';
import { useState } from 'react';
import './Home.css';

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

const Home = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();

  const { data: bestAnime, isLoading: bestLoading, error: bestError, refetch: refetchBest } = useTrendingAnime();
  const { data: seasonalAnime, isLoading: seasonalLoading, error: seasonalError } = useSeasonalAnime(currentYear, currentSeason);
  const { data: ongoingAnime, isLoading: ongoingLoading, error: ongoingError } = useOngoingAnime();
  const { data: recentAnime, isLoading: recentLoading, error: recentError } = useRecentlyReleased();

  const handleRetry = () => {
    refetchBest();
  };

  const topAnime = bestAnime?.[0];

  const handleNavigate = (filter) => {
    navigate(`/search?${filter}`);
  };

  const renderSection = (title, animeList, loading, error, filter) => (
    <section className="home-section">
      <h2 className="section-title">{title}</h2>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}
      {!loading && !error && (
        <>
          <div className="anime-grid">
            {animeList?.slice(0, 6).map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} index={index} />
            ))}
          </div>
          <div className="section-nav">
            <button className="nav-btn" onClick={() => handleNavigate(filter)}>
              Показать все
            </button>
          </div>
        </>
      )}
    </section>
  );

  return (
    <div className="home">
      {bestLoading ? (
        <LoadingSpinner />
      ) : bestError ? (
        <ErrorMessage message={bestError} onRetry={handleRetry} />
      ) : (
        <Hero anime={topAnime} />
      )}
      
      <div className="home-content">
        {renderSection('Лучшие аниме', bestAnime, bestLoading, bestError, 'order=ranked')}
        {renderSection('Сезонное', seasonalAnime, seasonalLoading, seasonalError, `season=${currentYear}_${currentSeason}`)}
        {renderSection('Онгоинги', ongoingAnime, ongoingLoading, ongoingError, 'status=ongoing')}
        {renderSection('Недавно вышло', recentAnime, recentLoading, recentError, 'status=released')}
      </div>
      <Footer />
    </div>
  );
};

export default Home;