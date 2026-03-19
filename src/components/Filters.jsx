import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Filters.css';

const GENRES = [
  'Action', 'Adventure', 'Cars', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const FORMATS = [
  { value: 'TV', label: 'TV' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Special' }
];

const STATUSES = [
  { value: 'FINISHED', label: 'Finished' },
  { value: 'RELEASING', label: 'Airing' },
  { value: 'NOT_YET_RELEASED', label: 'Not Yet Released' }
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const Filters = ({ filters, onChange, onApply, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onChange) {
      onChange(newFilters);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(localFilters);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = { genre: '', year: '', format: '', status: '' };
    setLocalFilters(emptyFilters);
    if (onReset) {
      onReset();
    }
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v).length;

  return (
    <div className="filters-container">
      <button 
        className={`filters-toggle ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="filters-count">{activeFiltersCount}</span>
        )}
        <svg 
          className="toggle-arrow" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="filters-panel"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Genre</label>
                <select 
                  className="filter-select"
                  value={localFilters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  <option value="">All Genres</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Year</label>
                <select 
                  className="filter-select"
                  value={localFilters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">All Years</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Type</label>
                <select 
                  className="filter-select"
                  value={localFilters.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                >
                  <option value="">All Types</option>
                  {FORMATS.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select 
                  className="filter-select"
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filters-actions">
              <button className="filters-reset" onClick={handleReset}>
                Reset
              </button>
              <button className="filters-apply" onClick={handleApply}>
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Filters;
