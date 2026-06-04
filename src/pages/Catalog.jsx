import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  const [page, setPage] = useState(1);

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

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['catalog', category, yearParam, page],
    queryFn: () => anilibriaApi.getTitleList(config.buildParams(page)),
    enabled: !!config,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  const anime = data?.data || [];
  const total = data?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [category, yearParam]);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
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
          {isLoading && (
            <div className="catalog-grid">
              <SkeletonGrid count={ITEMS_PER_PAGE} />
            </div>
          )}

          {error && !isLoading && (
            <div className="catalog-error">
              <p>Ошибка: {error?.message || error}</p>
              <button onClick={() => refetch()}>Повторить</button>
            </div>
          )}

          {!isLoading && !error && !anime.length && (
            <motion.div
              className="catalog-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2>Ничего не найдено</h2>
              <p>В этой категории пока нет тайтлов</p>
            </motion.div>
          )}

          {!isLoading && anime.length > 0 && (
            <>
              <div className="catalog-grid">
                {anime.map((item, index) => (
                  <AnimeCard key={item.id} anime={item} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  <button
                    className={`pagination-btn ${isFetching ? 'loading' : ''}`}
                    disabled={page <= 1 || isFetching}
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
                        className={`pagination-btn pagination-num ${page === p ? 'active' : ''} ${isFetching ? 'loading' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className={`pagination-btn ${isFetching ? 'loading' : ''}`}
                    disabled={page >= totalPages || isFetching}
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
