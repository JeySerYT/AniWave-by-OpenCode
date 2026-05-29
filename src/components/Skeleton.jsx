import { motion } from 'framer-motion';
import './Skeleton.css';

const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="skeleton-card"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="skeleton-poster" />
          <div className="skeleton-title" />
          <div className="skeleton-subtitle" />
        </motion.div>
      ))}
    </div>
  );
};

const SkeletonBanner = () => (
  <div className="skeleton-banner">
    <div className="skeleton-banner-img" />
    <div className="skeleton-banner-info">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-80" />
      <div className="skeleton-line w-40" />
    </div>
  </div>
);

const SkeletonLine = ({ width = '100%' }) => (
  <div className="skeleton-line" style={{ width }} />
);

export { SkeletonGrid, SkeletonBanner, SkeletonLine };
