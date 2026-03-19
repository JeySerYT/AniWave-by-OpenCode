import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="loading-spinner-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="spinner-wrapper">
        <div className="spinner-logo">
          <div className="spinner-circle"></div>
          <span className="spinner-text">AW</span>
        </div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </motion.div>
  );
};

export default LoadingSpinner;
