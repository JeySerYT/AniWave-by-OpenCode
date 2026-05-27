import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  { value: 'created_at', label: 'По дате добавления' },
];

const GENRES_LIST = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

const SearchPage = () => {
  const { anime, loading, error, filters, updateFilters, resetFilters, doSearch, loadMore, hasMore } = useSearch();
  const [input, setInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  const [localGenre, setLocalGenre] = useState('');
  const [localYear, setLocalYear] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    anilibriaApi.getGenres().then(r => {
      if (r?.data) setGenres(r.data.map(g => g.name || g));
    }).catch(() => {});
  }, []);

  const triggerSearch = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilters({ search: text });
    }, 400);
  }, [updateFilters]);

  useEffect(() => {
    doSearch(true);
  }, [filters]);

  const handleInputChange = (val) => {
    setInput(val);
    triggerSearch(val);
  };

  const applyLocalFilters = () => {
    updateFilters({
      genre: localGenre,
      year: localYear || '',
      status: localStatus,
    });
    setShowFilters(false);
  };

  const handleReset = () => {
    setInput('');
    setLocalGenre('');
    setLocalYear('');
    setLocalStatus('');
    resetFilters();
  };

  const activeFilters = [filters.genre, filters.year, filters.status].filter(Boolean).length;
  const currentSort = SORTS.find(s => s.value === filters.sort) || SORTS[0];

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
                onClick={() => updateFilters({ sort: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
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
                <div className="filter-col">
                  <label>Жанр</label>
                  <select value={localGenre} onChange={e => setLocalGenre(e.target.value)}>
                    <option value="">Любой</option>
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-col">
                  <label>Год</label>
                  <select value={localYear} onChange={e => setLocalYear(e.target.value)}>
                    <option value="">Любой</option>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-col">
                  <label>Статус</label>
                  <select value={localStatus} onChange={e => setLocalStatus(e.target.value)}>
                    <option value="">Любой</option>
                    <option value="ongoing">Онгоинг</option>
                    <option value="released">Вышел</option>
                    <option value="announced">Анонс</option>
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button className="filter-apply" onClick={applyLocalFilters}>Применить</button>
                <button className="filter-reset" onClick={() => { setLocalGenre(''); setLocalYear(''); setLocalStatus(''); }}>
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
            <p>Ошибка при загрузке: {error}</p>
            <button onClick={() => doSearch(true)}>Повторить</button>
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
              Найдено {anime.length}+ результатов
            </motion.p>
            <div className="anime-grid">
              {anime.map((item, index) => (
                <AnimeCard key={item.id} anime={item} index={index} />
              ))}
            </div>
            {hasMore && (
              <motion.div className="load-more-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
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
