import { motion } from 'framer-motion';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry,
  icon = '⚠️'
}) => {
  return (
    <motion.div 
      className="error-message-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-icon-wrapper">
        <svg className="error-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      
      <h3 className="error-title">Oops!</h3>
      <p className="error-message">{message}</p>
      
      {onRetry && (
        <motion.button 
          className="retry-button"
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
