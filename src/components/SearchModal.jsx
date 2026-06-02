import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { useSearch } from '../hooks/useSearch';
import { anilibriaApi } from '../api/anilibria';
import './SearchModal.css';

const QUICK_FILTERS = [
  { label: 'Популярное', icon: TrendingUp, sort: 'popularity' },
  { label: 'Новинки', icon: Clock, sort: 'updated_at' },
  { label: 'Лучшее', icon: Star, sort: 'rating' },
];

function SearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const { anime, loading, filters, total, updateFilters, resetFilters, doSearch } = useSearch();
  const [input, setInput] = useState('');
  const [activeSort, setActiveSort] = useState('popularity');
  const [genres, setGenres] = useState([]);
  const [localGenre, setLocalGenre] = useState('');
  const [localYear, setLocalYear] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const initDone = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setInput('');
      setActiveSort('popularity');
      setShowFilters(false);
      setLocalGenre('');
      setLocalYear('');
      setLocalStatus('');
      resetFilters();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    anilibriaApi.getGenres().then(r => {
      if (Array.isArray(r) && mounted.current) setGenres(r);
    }).catch(() => {});
  }, [open]);

  const runSearch = useCallback((f, reset) => {
    doSearch(f, reset);
  }, [doSearch]);

  const handleInputChange = (val) => {
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = { ...filters, search: val, genre: '', year: '', status: '' };
      setLocalGenre('');
      setLocalYear('');
      setLocalStatus('');
      updateFilters({ search: val, genre: '', year: '', status: '' });
      runSearch(next, true);
    }, 300);
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    const next = { ...filters, search: input, sort };
    updateFilters({ sort });
    runSearch(next, true);
  };

  const applyFilters = () => {
    const next = { ...filters, search: input, genre: localGenre, year: localYear, status: localStatus };
    updateFilters({ genre: localGenre, year: localYear, status: localStatus });
    runSearch(next, true);
  };

  const handleCardClick = (id) => {
    onClose();
    navigate('/anime/' + id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-modal-overlay"
          layoutId="search-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            className="search-modal"
            layoutId="search-modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-modal-header">
              <div className="search-modal-input-wrap">
                <Search size={18} className="search-modal-icon" />
                <input
                  ref={inputRef}
                  className="search-modal-input"
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Поиск аниме..."
                  autoComplete="off"
                />
                {input && (
                  <button className="search-modal-clear" onClick={() => handleInputChange('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className="search-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="search-modal-body">
              <div className="search-modal-sorts">
                <div className="sort-chips">
                  {QUICK_FILTERS.map(({ label, icon: Icon, sort }) => (
                    <button
                      key={sort}
                      className={`sort-chip ${activeSort === sort ? 'active' : ''}`}
                      onClick={() => handleSortChange(sort)}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <button
                  className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Фильтры
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    className="search-modal-filters"
                    layoutId="search-modal-filters"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="filter-row">
                      <select value={localGenre} onChange={(e) => setLocalGenre(e.target.value)}>
                        <option value="">Любой жанр</option>
                        {genres.map((g) => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                      <select value={localYear} onChange={(e) => setLocalYear(e.target.value)}>
                        <option value="">Любой год</option>
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <select value={localStatus} onChange={(e) => setLocalStatus(e.target.value)}>
                        <option value="">Любой статус</option>
                        <option value="ongoing">Онгоинг</option>
                        <option value="released">Вышел</option>
                      </select>
                      <button className="filter-apply-btn" onClick={applyFilters}>
                        Применить
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="search-modal-results">
                {loading && anime.length === 0 && (
                  <div className="search-modal-loading">
                    <div className="loading-spinner" />
                    <span>Поиск...</span>
                  </div>
                )}

                {!loading && !input && !anime.length && (
                  <div className="search-modal-empty">
                    <Search size={32} className="empty-icon" />
                    <p>Начните вводить название аниме</p>
                  </div>
                )}

                {!loading && input && anime.length === 0 && (
                  <div className="search-modal-empty">
                    <Search size={32} className="empty-icon" />
                    <p>Ничего не найдено</p>
                  </div>
                )}

                {anime.length > 0 && (
                  <>
                    <p className="search-modal-count">
                      Найдено {total || anime.length} результатов
                    </p>
                    <div className="search-modal-grid">
                      {anime.slice(0, 12).map((item, i) => (
                        <div key={item.id} onClick={() => handleCardClick(item.id)}>
                          <AnimeCard anime={item} index={i} />
                        </div>
                      ))}
                    </div>
                    {total > 12 && (
                      <button
                        className="search-modal-view-all"
                        onClick={() => { onClose(); navigate('/search'); }}
                      >
                        Показать все результаты
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchModal;
