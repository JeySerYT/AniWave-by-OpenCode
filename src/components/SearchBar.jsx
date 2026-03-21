import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './SearchBar.css';

const SearchBar = ({ 
  value = '', 
  onChange, 
  onSearch,
  placeholder = 'Search anime...',
  debounceDelay = 300
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (onChange) {
      debounceTimer.current = setTimeout(() => {
        onChange(inputValue);
      }, debounceDelay);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, debounceDelay, onChange, value]);

  const handleClear = () => {
    setInputValue('');
    if (onChange) {
      onChange('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(inputValue);
    }
  };

  return (
    <motion.div 
      className={`search-bar ${isFocused ? 'focused' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="search-input-container">
        <span className="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          aria-label={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {inputValue && (
          <motion.button 
            className="clear-btn"
            onClick={handleClear}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            aria-label="Clear search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        )}
      </div>

      {onSearch && (
        <button className="search-btn" onClick={() => onSearch(inputValue)} aria-label="Search" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span>Search</span>
        </button>
      )}
    </motion.div>
  );
};

export default SearchBar;
