import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import bunnyImg from '../assets/404.webp';
import './NotFound.css';

const NotFound = () => (
  <motion.div
    className="not-found"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="not-found-illustration">
      <motion.div
        className="bunny-wrapper"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <img src={bunnyImg} alt="" className="bunny-img" loading="lazy" width="400" height="520" />
        <div className="bunny-shadow" />
      </motion.div>
    </div>
    <div className="not-found-content">
      <motion.h1
        className="not-found-title"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        404
      </motion.h1>
      <motion.p
        className="not-found-subtitle"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        Ой, страница потерялась
      </motion.p>
      <motion.p
        className="not-found-desc"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Такой страницы нет. Возможно, она ускакала вместе с зайкой.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <Link to="/" className="not-found-btn">На главную</Link>
      </motion.div>
    </div>
  </motion.div>
);

export default NotFound;
