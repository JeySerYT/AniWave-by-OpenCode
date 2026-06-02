import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, TrendingUp } from 'lucide-react';
import bunnyImg from '../assets/404.webp';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate('/search?q=' + encodeURIComponent(query.trim()));
  };

  return (
    <div className="not-found" ref={containerRef}>
      <div className="not-found-bg" />
      <motion.div
        className="not-found-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="not-found-visual">
          <motion.div
            className="bunny-wrapper"
            animate={{
              x: mousePos.x * 8,
              y: mousePos.y * 8,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <img src={bunnyImg} alt="" className="bunny-img" />
            <div className="bunny-shadow" />
          </motion.div>
        </div>

        <div className="not-found-body">
          <div className="not-found-code">
            <span className={`glitch-text ${glitchActive ? 'glitch' : ''}`}>4</span>
            <span className="not-found-zero">0</span>
            <span className={`glitch-text ${glitchActive ? 'glitch' : ''}`}>4</span>
          </div>

          <h2 className="not-found-title">Страница не найдена</h2>
          <p className="not-found-desc">
            Возможно, она ускакала вместе с зайкой. Попробуйте поискать то, что искали.
          </p>

          <form className="not-found-search" onSubmit={handleSearch}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Поиск аниме..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="not-found-links">
            <Link to="/" className="not-found-link primary">
              <Home size={15} /> На главную
            </Link>
            <Link to="/search" className="not-found-link secondary">
              <Search size={15} /> Поиск
            </Link>
            <Link to="/" className="not-found-link secondary">
              <TrendingUp size={15} /> Популярное
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
