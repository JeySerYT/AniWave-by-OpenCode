import { motion } from 'framer-motion';
import './Skeleton.css';

const SkeletonGrid = ({ count = 6 }) => {
  return Array.from({ length: count }, (_, i) => (
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
  ));
};

const SkeletonHero = () => (
  <section className="hero">
    <div className="hero-overlay" />
    <div className="hero-content">
      <div className="hero-layout">
        <div className="hero-info" style={{ opacity: 0.6 }}>
          <div className="skeleton-line w-50" style={{ height: 32, marginBottom: 8 }} />
          <div className="skeleton-line w-30" style={{ height: 18, marginBottom: 16 }} />
          <div className="hero-genres">
            <div className="skeleton-line" style={{ width: 72, height: 28, borderRadius: 9999, margin: 0 }} />
            <div className="skeleton-line" style={{ width: 80, height: 28, borderRadius: 9999, margin: 0 }} />
            <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: 9999, margin: 0 }} />
          </div>
          <div className="skeleton-line w-90" style={{ height: 16, marginBottom: 4 }} />
          <div className="skeleton-line w-60" style={{ height: 16, marginBottom: 24 }} />
          <div className="hero-actions">
            <div className="skeleton-line" style={{ width: 140, height: 44, borderRadius: 12, margin: 0 }} />
            <div className="skeleton-line" style={{ width: 120, height: 44, borderRadius: 12, margin: 0 }} />
          </div>
        </div>
        <div className="hero-poster-wrap" style={{ opacity: 0.6 }}>
          <div className="hero-poster">
            <div className="skeleton-poster" style={{ width: 200, height: 280, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SkeletonLine = ({ width = '100%' }) => (
  <div className="skeleton-line" style={{ width }} />
);

const SkeletonAnimeDetails = () => (
  <div className="anime-details">
    <div className="details-banner">
      <div className="skeleton-full" />
      <div className="banner-overlay" />
      <div className="banner-gradient" />
    </div>
    <div className="details-content">
      <div className="details-main">
        <div className="details-left">
          <div className="details-cover">
            <div className="skeleton-poster" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 20 }} />
          </div>
        </div>
        <div className="details-right" style={{ opacity: 0.6 }}>
          <div className="title-row">
            <div className="skeleton-line w-70" style={{ height: 48, margin: 0 }} />
            <div className="trailer-wrap">
              <div className="skeleton-line" style={{ width: 42, height: 42, borderRadius: '50%', margin: 0 }} />
            </div>
          </div>
          <div className="skeleton-line w-40" style={{ height: 18, marginBottom: 16 }} />
          <div className="details-meta">
            <div className="skeleton-line" style={{ width: 60, height: 30, borderRadius: 9999, margin: 0 }} />
            <div className="skeleton-line" style={{ width: 80, height: 30, borderRadius: 9999, margin: 0 }} />
            <div className="skeleton-line" style={{ width: 70, height: 30, borderRadius: 9999, margin: 0 }} />
          </div>
          <div className="details-description glass-card">
            <div className="skeleton-line w-90" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-60" />
          </div>
          <div className="info-panel glass-card">
            <div className="info-row">
              <span className="skeleton-line" style={{ width: 100, margin: 0, flexShrink: 0 }} />
              <span className="skeleton-line" style={{ width: 180, margin: 0 }} />
            </div>
            <div className="info-row">
              <span className="skeleton-line" style={{ width: 100, margin: 0, flexShrink: 0 }} />
              <span className="skeleton-line" style={{ width: 120, margin: 0 }} />
            </div>
            <div className="info-row">
              <span className="skeleton-line" style={{ width: 100, margin: 0, flexShrink: 0 }} />
              <span className="skeleton-line" style={{ width: 80, margin: 0 }} />
            </div>
            <div className="info-row" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <span className="skeleton-line" style={{ width: 100, margin: 0, flexShrink: 0 }} />
              <span className="skeleton-line" style={{ width: 140, margin: 0 }} />
            </div>
          </div>
        </div>
      </div>
      <section className="related-section">
        <div className="skeleton-line w-20" style={{ height: 28, marginBottom: 32 }} />
        <div className="related-grid">
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
      </section>
    </div>
  </div>
);

export { SkeletonGrid, SkeletonLine, SkeletonAnimeDetails, SkeletonHero };
