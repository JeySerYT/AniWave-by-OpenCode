import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Settings, LogOut, LogIn, UserPlus, Home, Folder, Library } from 'lucide-react';
import Logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/catalog', label: 'Каталог', icon: Library },
  { path: '/my-list', label: 'Мои коллекции', icon: Folder },
];

function Header({ onSearchOpen }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    closeMenu();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <motion.img
              src={Logo}
              alt="AniWave"
              className="logo-img"
              loading="lazy"
              width="120"
              height="32"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>

        <div className="header-center">
          <nav className="header-nav">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`header-nav-link ${location.pathname === path ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <button className="header-search-btn" onClick={onSearchOpen}>
            <Search size={18} />
            <span className="header-search-text">Поиск</span>
          </button>
        </div>

        <div className="header-right">
          <button className="header-mobile-search" onClick={onSearchOpen} aria-label="Поиск">
            <Search size={18} />
          </button>
          <div className="header-profile" ref={profileRef}>
          {user ? (
            <button
              className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-label="Профиль"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="profile-avatar-img" loading="lazy" width="32" height="32" />
              ) : (
                <div className="profile-avatar-fallback">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </button>
          ) : (
            <Link to="/login" className="header-login-btn">
              <LogIn size={16} />
              <span>Войти</span>
            </Link>
          )}

          <AnimatePresence>
            {profileMenuOpen && user && (
              <motion.div
                className="profile-dropdown"
                layoutId="header-profile-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" loading="lazy" width="40" height="40" />
                    ) : (
                      <div className="dropdown-avatar-fallback">
                        {user.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-username">{user.username}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                  <User size={16} />
                  <span>Профиль</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                  <Settings size={16} />
                  <span>Настройки</span>
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Выход</span>
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            layoutId="header-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mobile-menu-content">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`mobile-nav-link ${location.pathname === path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="mobile-menu-divider" />
              <button className="mobile-nav-link" onClick={() => { onSearchOpen(); closeMenu(); }}>
                <Search size={18} />
                <span>Поиск</span>
              </button>
              <Link to="/profile" className={`mobile-nav-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={closeMenu}>
                <User size={18} />
                <span>Профиль</span>
              </Link>
              {user ? (
                <>
                  <Link to="/settings" className={`mobile-nav-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={closeMenu}>
                    <Settings size={18} />
                    <span>Настройки</span>
                  </Link>
                  <button className="mobile-nav-link logout-mobile" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>
                    <LogIn size={18} />
                    <span>Войти</span>
                  </Link>
                  <Link to="/register" className="mobile-nav-link" onClick={closeMenu}>
                    <UserPlus size={18} />
                    <span>Регистрация</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
