import './Skeleton.css';

export const SkeletonCard = ({ width = '100%', height = 280 }) => (
  <div
    className="skeleton-card"
    style={{ width, height }}
  />
);

export const SkeletonLine = ({ width = '100%', height = 16 }) => (
  <div
    className="skeleton-line"
    style={{ width, height }}
  />
);

export const SkeletonCircle = ({ size = 60 }) => (
  <div
    className="skeleton-circle"
    style={{ width: size, height: size }}
  />
);

export const SkeletonHero = () => (
  <div className="skeleton-hero">
    <div className="skeleton-hero-banner" />
    <div className="skeleton-hero-content">
      <div className="skeleton-hero-left">
        <SkeletonLine width="60%" height={32} />
        <SkeletonLine width="40%" height={20} />
        <SkeletonLine width="30%" height={16} />
        <SkeletonLine width="80%" height={14} />
        <SkeletonLine width="70%" height={14} />
        <div className="skeleton-hero-buttons">
          <div className="skeleton-hero-btn" />
          <div className="skeleton-hero-btn" />
        </div>
      </div>
      <div className="skeleton-hero-right">
        <SkeletonCard width={200} height={300} />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonDetails = () => (
  <div className="skeleton-details">
    <div className="skeleton-details-banner" />
    <div className="skeleton-details-content">
      <div className="skeleton-details-left">
        <SkeletonCard width="100%" height={400} />
      </div>
      <div className="skeleton-details-right">
        <SkeletonLine width="70%" height={36} />
        <SkeletonLine width="50%" height={20} />
        <div className="skeleton-details-meta">
          <SkeletonLine width={80} height={32} />
          <SkeletonLine width={80} height={32} />
          <SkeletonLine width={80} height={32} />
        </div>
        <SkeletonLine width="40%" height={24} />
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="95%" height={14} />
        <SkeletonLine width="60%" height={14} />
      </div>
    </div>
  </div>
);
