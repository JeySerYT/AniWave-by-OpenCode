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
    <div className="skeleton-banner-img" style={{ height: 400 }} />
    <div className="details-content-skeleton">
      <div className="details-main-skeleton">
        <div className="details-left-skeleton">
          <div className="skeleton-poster" style={{ width: 220, height: 330, borderRadius: 16 }} />
        </div>
        <div className="details-right-skeleton">
          <div className="skeleton-line w-70" style={{ height: 28, marginBottom: 8 }} />
          <div className="skeleton-line w-50" style={{ height: 18, marginBottom: 16 }} />
          <div className="meta-row-skeleton">
            <div className="skeleton-line" style={{ width: 60, height: 16 }} />
            <div className="skeleton-line" style={{ width: 80, height: 16 }} />
            <div className="skeleton-line" style={{ width: 50, height: 16 }} />
          </div>
          <div className="skeleton-line w-100" style={{ height: 14, marginBottom: 6 }} />
          <div className="skeleton-line w-90" style={{ height: 14, marginBottom: 6 }} />
          <div className="skeleton-line w-60" style={{ height: 14, marginBottom: 24 }} />
          <div className="info-panel-skeleton">
            <div className="skeleton-line w-50" style={{ height: 14, marginBottom: 8 }} />
            <div className="skeleton-line w-40" style={{ height: 14, marginBottom: 8 }} />
            <div className="skeleton-line w-30" style={{ height: 14, marginBottom: 8 }} />
            <div className="skeleton-line w-45" style={{ height: 14 }} />
          </div>
        </div>
      </div>
      <div className="related-skeleton">
        <div className="skeleton-line w-30" style={{ height: 22, marginBottom: 16 }} />
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
