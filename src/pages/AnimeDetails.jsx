import { useParams } from 'react-router-dom';
import { useState } from 'react';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useAnimeById } from '../hooks/useAnime';
import { useFavorites } from '../hooks/useFavorites';
import './AnimeDetails.css';

const AnimeDetails = () => {
  const { id } = useParams();
  const { data, loading, error, refetch } = useAnimeById(parseInt(id));
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFullDesc, setShowFullDesc] = useState(false);

  const anime = data?.Media;
  const favorite = isFavorite(parseInt(id));

  const handleWatchTrailer = () => {
    if (anime?.trailer?.site === 'youtube' && anime?.trailer?.id) {
      window.open(`https://www.youtube.com/watch?v=${anime.trailer.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const formatStatus = (status) => {
    const statuses = {
      FINISHED: 'Finished',
      RELEASING: 'Airing',
      NOT_YET_RELEASED: 'Not Yet Released',
      CANCELLED: 'Cancelled',
      HIATUS: 'On Hiatus'
    };
    return statuses[status] || status;
  };

  const relatedAnime = anime?.relations?.edges?.slice(0, 6) || [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />;
  if (!anime) return <ErrorMessage message="Anime not found" />;

  const title = anime.title?.english || anime.title?.romaji || 'Unknown';
  const coverImage = anime.coverImage?.large || anime.coverImage?.medium;
  const bannerImage = anime.bannerImage || coverImage;
  const description = anime.description?.replace(/<[^>]*>/g, '') || 'No description available';

  return (
    <div className="anime-details">
      <div className="details-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="banner-overlay" />
      </div>

      <div className="details-content">
        <div className="details-main">
          <div className="details-left">
            <div className="details-cover">
              {coverImage && <img src={coverImage} alt={title} />}
              <button 
                className={`favorite-btn ${favorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(anime)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{favorite ? 'In Favorites' : 'Add to Favorites'}</span>
              </button>
            </div>
          </div>

          <div className="details-right">
            <h1 className="details-title">{title}</h1>
            {anime.title?.romaji && anime.title?.english && (
              <p className="details-title-native">{anime.title.romaji}</p>
            )}

            <div className="details-meta">
              {anime.averageScore && (
                <div className="meta-rating">
                  <span className="star">★</span>
                  <span className="score">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="meta-episodes">
                  <span>{anime.episodes} Episodes</span>
                </div>
              )}
              {anime.status && (
                <div className="meta-status">
                  <span>{formatStatus(anime.status)}</span>
                </div>
              )}
              {anime.format && (
                <div className="meta-format">
                  <span>{anime.format}</span>
                </div>
              )}
            </div>

            <div className="details-genres">
              {anime.genres?.map((genre) => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>

            <div className="details-description">
              <p>
                {showFullDesc ? description : description.slice(0, 300)}
                {description.length > 300 && !showFullDesc && '...'}
              </p>
              {description.length > 300 && (
                <button className="show-more-btn" onClick={() => setShowFullDesc(!showFullDesc)}>
                  {showFullDesc ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>

            <div className="details-info">
              {anime.season && (
                <div className="info-row">
                  <span className="info-label">Season:</span>
                  <span className="info-value">{anime.season} {anime.seasonYear}</span>
                </div>
              )}
              {anime.duration && (
                <div className="info-row">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{anime.duration} min/ep</span>
                </div>
              )}
              {anime.studios?.nodes?.[0]?.name && (
                <div className="info-row">
                  <span className="info-label">Studio:</span>
                  <span className="info-value">{anime.studios.nodes[0].name}</span>
                </div>
              )}
            </div>

            {anime.trailer?.id && (
              <button className="trailer-btn" onClick={handleWatchTrailer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {relatedAnime.length > 0 && (
          <section className="related-section">
            <h2 className="related-title">Related / Similar Anime</h2>
            <div className="related-grid">
              {relatedAnime.map((relation) => (
                <AnimeCard 
                  key={relation.node.id} 
                  anime={relation.node} 
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnimeDetails;