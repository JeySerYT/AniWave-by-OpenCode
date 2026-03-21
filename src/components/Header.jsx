import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/logo.svg';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('home') },
    { path: '/search', label: t('search') },
    { path: '/profile', label: t('profile') },
  ];

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <motion.img 
            src={Logo} 
            alt="AniWave" 
            className="logo-img"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </Link>
        
        <nav className="nav">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
            >
              <span className="nav-text">{label}</span>
            </Link>
          ))}
        </nav>

        <button 
          type="button" 
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Toggle menu" 
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mobile-menu-content">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`mobile-nav-link ${isActive(path) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
