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

const SkeletonAnimeDetails = () => (
  <div className="anime-details-skeleton">
    <div className="skeleton-banner-img" style={{ height: 400, width: '100%', borderRadius: 0 }} />
    <div className="details-content-skeleton">
      <div className="details-main-skeleton">
        <div className="skeleton-poster" style={{ width: 200, height: 280, borderRadius: 16 }} />
        <div className="details-right-skeleton">
          <div className="skeleton-line w-60" style={{ height: 24, marginBottom: 4 }} />
          <div className="skeleton-line w-40" style={{ height: 16, marginBottom: 20 }} />
          <div className="info-panel-skeleton">
            <div className="skeleton-line w-80" style={{ height: 14, marginBottom: 6 }} />
            <div className="skeleton-line w-60" style={{ height: 14, marginBottom: 6 }} />
            <div className="skeleton-line w-40" style={{ height: 14 }} />
          </div>
        </div>
      </div>
      <div className="related-skeleton">
        <div className="skeleton-line w-20" style={{ height: 20, marginBottom: 16 }} />
        <div className="skeleton-grid">
          {Array.from({ length: 6 }, (_, i) => (
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
      </div>
    </div>
  </div>
);

export { SkeletonGrid, SkeletonBanner, SkeletonLine, SkeletonAnimeDetails };
