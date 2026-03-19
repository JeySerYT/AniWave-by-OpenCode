import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../assets/logo.svg';
import './Footer.css';

function Footer() {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="footer-content">
        <div className="footer-brand">
          <img src={Logo} alt="AniWave" className="footer-logo" />
          <p className="footer-tagline">Твой каталог аниме</p>
        </div>
        
        <div className="footer-links">
          <h4>Навигация</h4>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/search">Каталог</Link></li>
            <li><Link to="/profile">Профиль</Link></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h4>Информация</h4>
          <ul>
            <li><a href="#privacy">Политика конфиденциальности</a></li>
            <li><a href="#terms">Условия использования</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4>Контакты</h4>
          <p>support@aniwave.com</p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Telegram">TG</a>
            <a href="#" className="social-link" aria-label="Discord">Discord</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 AniWave. Все права защищены.</p>
        <p>Данные предоставлены AniList API</p>
      </div>
    </motion.footer>
  );
}

export default Footer;
