import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import { useSearch } from '../hooks/useSearch';
import { anilibriaApi } from '../api/anilibria';
import './Search.css';

const SORTS = [
  { value: 'rating', label: 'По рейтингу' },
  { value: 'popularity', label: 'По популярности' },
  { value: 'updated_at', label: 'По обновлению' },
];

const SearchPage = () => {
  const { anime, loading, error, filters, total, updateFilters, resetFilters, doSearch } = useSearch();
  const [input, setInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [localGenre, setLocalGenre] = useState('');
  const [localYear, setLocalYear] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const debounceRef = useRef(null);
  const initDone = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    anilibriaApi.getGenres().then(r => {
      if (Array.isArray(r) && mounted.current) setGenres(r);
    }).catch(() => {});

    anilibriaApi.getYears().then(r => {
      if (Array.isArray(r) && mounted.current) setYears(r);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!initDone.current && !loading) {
      initDone.current = true;
      doSearch(filters, true);
    }
  }, []);

  const runSearch = (f, reset) => {
    doSearch(f, reset);
  };

  const handleInputChange = (val) => {
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = { ...filters, search: val };
      updateFilters({ search: val });
      runSearch(next, true);
    }, 400);
  };

  const handleSortChange = (sort) => {
    const next = { ...filters, sort };
    updateFilters({ sort });
    runSearch(next, true);
  };

  const applyLocalFilters = () => {
    const next = { ...filters, genre: localGenre, year: localYear, status: localStatus };
    updateFilters({ genre: localGenre, year: localYear, status: localStatus });
    runSearch(next, true);
    setShowFilters(false);
  };

  const handleReset = () => {
    setInput('');
    setLocalGenre(''); setLocalYear(''); setLocalStatus('');
    const next = { search: '', genre: '', year: '', status: '', sort: 'popularity' };
    resetFilters();
    runSearch(next, true);
    setShowFilters(false);
  };

  const handleFilterToggle = () => {
    if (!showFilters) {
      setLocalGenre(filters.genre || '');
      setLocalYear(filters.year || '');
      setLocalStatus(filters.status || '');
    }
    setShowFilters(!showFilters);
  };

  const handleLoadMore = () => {
    runSearch(filters, false);
  };

  const activeFilters = [filters.genre, filters.year, filters.status].filter(Boolean).length;
  const hasMore = anime.length < total && anime.length > 0;

  return (
    <div className="search-page">
      <div className="search-hero">
        <motion.h1 className="search-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          Поиск аниме
        </motion.h1>

        <motion.div className="search-bar-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Search size={18} className="search-bar-icon" />
          <input
            className="search-input"
            type="text"
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            placeholder="Название аниме..."
          />
          {input && (
            <button className="search-clear" onClick={() => handleInputChange('')}>
              <X size={16} />
            </button>
          )}
        </motion.div>

        <motion.div className="search-controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="sort-tabs">
            {SORTS.map(s => (
              <button
                key={s.value}
                className={`sort-tab ${filters.sort === s.value ? 'active' : ''}`}
                onClick={() => handleSortChange(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={handleFilterToggle}
          >
            <SlidersHorizontal size={15} />
            <span>Фильтры</span>
            {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
            <ChevronDown size={14} className={`chevron ${showFilters ? 'open' : ''}`} />
          </button>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Жанр</label>
                  <div className="filter-select-wrap">
                    <select value={localGenre} onChange={e => setLocalGenre(e.target.value)}>
                      <option value="">Любой жанр</option>
                      {genres.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="select-chevron" />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Год выпуска</label>
                  <div className="filter-select-wrap">
                    <select value={localYear} onChange={e => setLocalYear(e.target.value)}>
                      <option value="">Любой год</option>
                      {years.slice().reverse().map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="select-chevron" />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Статус</label>
                  <div className="filter-select-wrap">
                    <select value={localStatus} onChange={e => setLocalStatus(e.target.value)}>
                      <option value="">Любой</option>
                      <option value="ongoing">Онгоинг</option>
                      <option value="released">Вышел</option>
                    </select>
                    <ChevronDown size={14} className="select-chevron" />
                  </div>
                </div>
              </div>
              <div className="filter-actions">
                <button className="filter-apply" onClick={applyLocalFilters}>Применить</button>
                <button className="filter-reset" onClick={handleReset}>
                  <RotateCcw size={13} /> Сбросить
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="search-results">
        {loading && anime.length === 0 && (
          <div className="search-skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-poster" />
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="search-error">
            <p>Ошибка: {error}</p>
            <button onClick={() => runSearch(filters, true)}>Повторить</button>
          </div>
        )}

        {!loading && !error && anime.length === 0 && (
          <motion.div className="search-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Search size={48} className="empty-icon" />
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить запрос или фильтры</p>
          </motion.div>
        )}

        {anime.length > 0 && (
          <>
            <motion.p className="results-count" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Найдено {total}+ результатов
            </motion.p>
            <div className="anime-grid">
              {anime.map((item, index) => (
                <AnimeCard key={item.id} anime={item} index={index} />
              ))}
            </div>
            {hasMore && (
              <motion.div className="load-more-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button className="load-more-btn" onClick={handleLoadMore} disabled={loading}>
                  {loading ? 'Загрузка...' : 'Показать ещё'}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
