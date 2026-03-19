import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/logo.svg';
import './Header.css';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={Logo} alt="AW" className="logo-img" />
        </Link>
        
        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Главная</Link>
          <Link to="/search" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Поиск</Link>
          <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>
        </nav>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Главная</Link>
            <Link to="/search" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Поиск</Link>
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
