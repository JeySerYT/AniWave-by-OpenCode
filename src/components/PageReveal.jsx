import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PageReveal.css';

const PageReveal = ({ children, isLoaded }) => {
  const [showReveal, setShowReveal] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setShowReveal(true);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  return (
    <AnimatePresence mode="wait">
      {!showContent ? (
        <motion.div
          className="page-reveal-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.div
            className="page-reveal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="page-reveal-logo">
              <div className="reveal-circle"></div>
              <span>AW</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="page-reveal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageReveal;