import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSearch } from '../hooks/useSearch';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { anime, loading, error, filters, updateFilters, resetFilters, refetch } = useSearch();
  const [localFilters, setLocalFilters] = useState({});
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const sort = searchParams.get('sort');
    const season = searchParams.get('season');
    const status = searchParams.get('status');
    const year = searchParams.get('year');

    const urlFilters = {};
    
    if (sort) {
      if (sort === 'POPULARITY') urlFilters.sort = 'POPULARITY';
      else if (sort === 'TRENDING') urlFilters.sort = 'TRENDING';
      else if (sort === 'SCORE') urlFilters.sort = 'SCORE';
    }

    if (season) {
      const seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
      if (seasons.includes(season.toUpperCase())) {
        urlFilters.season = season.toUpperCase();
      }
    }

    if (status) {
      const statuses = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED'];
      if (statuses.includes(status)) {
        urlFilters.status = status;
      }
    }

    if (year) {
      if (year === 'current') {
        urlFilters.year = new Date().getFullYear();
      } else {
        const yearNum = parseInt(year);
        if (!isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 1) {
          urlFilters.year = yearNum;
        }
      }
    }

    if (Object.keys(urlFilters).length > 0) {
      updateFilters(urlFilters);
    }
  }, [searchParams, updateFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: debouncedSearch });
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch, updateFilters]);

  const handleSearchChange = useCallback((value) => {
    setDebouncedSearch(value);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setLocalFilters(newFilters);
  };

  const handleFiltersApply = (appliedFilters) => {
    updateFilters({
      genre: appliedFilters.genre || '',
      year: appliedFilters.year ? parseInt(appliedFilters.year) : null,
      type: appliedFilters.format || null,
      status: appliedFilters.status || null,
    });
  };

  const handleFiltersReset = () => {
    setLocalFilters({});
    resetFilters();
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <ErrorMessage 
          message={error.message} 
          onRetry={() => refetch()} 
        />
      );
    }

    if (!loading && !error && anime.length === 0) {
      return (
        <div className="no-results">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="8" y1="8" x2="14" y2="14"/>
            <line x1="14" y1="8" x2="8" y2="14"/>
          </svg>
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить поисковый запрос или фильтры</p>
        </div>
      );
    }

    return (
      <>
        <p className="results-count">{anime.length} результатов найдено</p>
        <div className="anime-grid">
          {anime.map((item, index) => (
            <AnimeCard key={item.id} anime={item} index={index} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">Поиск аниме</h1>
        <div className="search-bar-container">
          <SearchBar
            value={debouncedSearch}
            onChange={handleSearchChange}
            placeholder="Поиск аниме..."
          />
        </div>
        <div className="filters-container-wrapper">
          <Filters
            filters={localFilters}
            onChange={handleFiltersChange}
            onApply={handleFiltersApply}
            onReset={handleFiltersReset}
          />
        </div>
      </div>

      <div className="search-results">
        {renderContent()}
      </div>
    </div>
  );
};

export default Search;