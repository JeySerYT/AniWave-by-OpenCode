import { motion } from 'framer-motion';
import './ErrorMessage.css';

const ErrorMessage = ({
  message = 'Something went wrong',
  onRetry
}) => {
  return (
    <motion.div
      className="error-message-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-message-content">
        <p className="error-message-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{message}</span>
        </p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Повторить
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
