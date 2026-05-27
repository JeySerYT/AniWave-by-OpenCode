import { useState, useCallback } from 'react';
import { anilibriaApi } from '../api/anilibria';

export const useSearch = (initialFilters = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    year: '',
    kind: '',
    status: '',
    sort: 'rating',
    ...initialFilters,
  });

  const search = useCallback(async (reset = true, pageOverride) => {
    if (reset) {
      setPage(1);
      setAnime([]);
    }

    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : (pageOverride ?? page);
      const params = {
        limit: 20,
        page: currentPage,
      };

      if (filters.search) {
        params.filter = 'name';
        params.search = filters.search;
      }

      if (filters.sort) {
        params.sort = filters.sort;
      }

      if (filters.year) {
        params.filter = (params.filter ? params.filter + ',' : '') + 'year';
        params.year = String(filters.year);
      }

      if (filters.status) {
        params.filter = (params.filter ? params.filter + ',' : '') + 'publish_status';
        params.publish_status = filters.status;
      }

      const response = await anilibriaApi.getTitleList(params);
      const list = response?.data || [];
      
      if (reset) {
        setAnime(list);
      } else {
        setAnime(prev => [...prev, ...list]);
      }
      
      setHasMore(list.length >= 20);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      genre: '',
      year: '',
      kind: '',
      status: '',
      sort: 'rating',
    });
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => {
      const nextPage = prev + 1;
      search(false, nextPage);
      return nextPage;
    });
  }, [search]);

  return {
    anime,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    search,
    loadMore,
    hasMore,
    page,
  };
};

export default useSearch;
