import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import { SkeletonGrid } from '../components/Skeleton';
import { anilibriaApi } from '../api/anilibria';
import './Catalog.css';

const ITEMS_PER_PAGE = 24;

function getCurrentSeason() {
  const m = new Date().getMonth();
  if (m >= 0 && m <= 2) return 'winter';
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  return 'autumn';
}

const SEASON_NAMES = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'recent';
  const yearParam = searchParams.get('year') || '';
  const currentYear = new Date().getFullYear();

  const config = useMemo(() => {
    if (category === 'trending') {
      return {
        buildParams: (page) => ({ sorting: 'RATING_DESC', limit: ITEMS_PER_PAGE, page }),
      };
    }
    if (category === 'seasonal') {
      return {
        buildParams: (page) => ({
          sorting: 'RATING_DESC', limit: ITEMS_PER_PAGE, page,
          seasons: getCurrentSeason(),
        }),
      };
    }
    if (category === 'recent') {
      return {
        buildParams: (page) => ({ sorting: 'FRESH_AT_DESC', limit: ITEMS_PER_PAGE, page }),
      };
    }
    if (category === 'year') {
      const y = yearParam || currentYear;
      return {
        buildParams: (page) => ({
          sorting: 'RATING_DESC', limit: ITEMS_PER_PAGE, page,
          from_year: y, to_year: y,
        }),
      };
    }
    return null;
  }, [category, yearParam, currentYear]);

  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    setPage(1);
    setAnime([]);
  }, [config]);

  const fetchPage = useCallback(async (p) => {
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const params = config.buildParams(p);
      const response = await anilibriaApi.getTitleList(params);
      if (!mounted.current) return;
      setAnime(response?.data || []);
      setTotal(response?.meta?.pagination?.total || 0);
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchPage(1);
  }, [config, fetchPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    fetchPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 2);
      let end = Math.min(totalPages - 1, page + 2);
      if (page <= 3) { start = 2; end = Math.min(maxVisible - 1, totalPages - 1); }
      if (page >= totalPages - 2) { start = Math.max(2, totalPages - maxVisible + 2); end = totalPages - 1; }
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (!config) {
    return (
      <div className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-empty">
            <h2>Категория не найдена</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <motion.div
          className="catalog-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="catalog-title">Каталог аниме</h1>
        </motion.div>

        {total > 0 && <p className="catalog-count">{total} тайтлов</p>}

        <div className="catalog-results">
          {loading && anime.length === 0 && (
            <div className="catalog-grid">
              <SkeletonGrid count={8} />
            </div>
          )}

          {error && !loading && (
            <div className="catalog-error">
              <p>Ошибка: {error}</p>
              <button onClick={() => fetchPage(page)}>Повторить</button>
            </div>
          )}

          {!loading && !error && anime.length === 0 && (
            <motion.div className="catalog-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Ничего не найдено</h2>
              <p>В этой категории пока нет тайтлов</p>
            </motion.div>
          )}

          {anime.length > 0 && (
            <>
              <div className="catalog-grid">
                {anime.map((item, index) => (
                  <AnimeCard key={item.id} anime={item} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} className="pagination-ellipsis">...</span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
