import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid } from '../components/Skeleton';
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

  const applyFilters = () => {
    const next = { ...filters, genre: localGenre, year: localYear, status: localStatus };
    updateFilters({ genre: localGenre, year: localYear, status: localStatus });
    runSearch(next, true);
  };

  const handleReset = () => {
    setInput('');
    setLocalGenre(''); setLocalYear(''); setLocalStatus('');
    const next = { search: '', genre: '', year: '', status: '', sort: 'popularity' };
    resetFilters();
    runSearch(next, true);
  };

  const handleLoadMore = () => {
    runSearch(filters, false);
  };

  const hasMore = anime.length < total && anime.length > 0;

  return (
    <div className="catalog-page">
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <p className="sidebar-title">Фильтры</p>

          <div className="sidebar-section">
            <label className="sidebar-label">Жанр</label>
            <select
              className="sidebar-select"
              value={localGenre}
              onChange={e => setLocalGenre(e.target.value)}
            >
              <option value="">Любой жанр</option>
              {genres.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Год выпуска</label>
            <select
              className="sidebar-select"
              value={localYear}
              onChange={e => setLocalYear(e.target.value)}
            >
              <option value="">Любой год</option>
              {years.slice().reverse().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Статус</label>
            <select
              className="sidebar-select"
              value={localStatus}
              onChange={e => setLocalStatus(e.target.value)}
            >
              <option value="">Любой</option>
              <option value="ongoing">Онгоинг</option>
              <option value="released">Вышел</option>
            </select>
          </div>

          <div className="sidebar-section">
            <button className="sidebar-reset-btn" onClick={handleReset}>
              <RotateCcw size={13} />
              Сбросить
            </button>
          </div>
        </aside>

        <main className="catalog-main">
          <div className="catalog-header">
            <motion.h1
              className="catalog-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Каталог аниме
            </motion.h1>

            <motion.div
              className="catalog-search-wrap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Search size={18} className="catalog-search-icon" />
              <input
                className="catalog-search-input"
                type="text"
                value={input}
                onChange={e => handleInputChange(e.target.value)}
                placeholder="Название аниме..."
              />
            </motion.div>

            <motion.div
              className="catalog-sorts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {SORTS.map(s => (
                <button
                  key={s.value}
                  className={`catalog-sort-btn ${filters.sort === s.value ? 'active' : ''}`}
                  onClick={() => handleSortChange(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </motion.div>
          </div>

          <div className="catalog-results">
            {loading && anime.length === 0 && (
              <div className="anime-grid">
                <SkeletonGrid count={8} />
              </div>
            )}

            {error && !loading && (
              <div className="catalog-error">
                <p>Ошибка: {error}</p>
                <button onClick={() => runSearch(filters, true)}>Повторить</button>
              </div>
            )}

            {!loading && !error && anime.length === 0 && (
              <motion.div className="catalog-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Search size={48} className="catalog-empty-icon" />
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
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
