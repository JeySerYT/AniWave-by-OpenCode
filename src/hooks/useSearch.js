import { useState, useCallback, useRef, useEffect } from 'react';
import { anilibriaApi } from '../api/anilibria';

export const useSearch = (initialFilters = {}) => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchId = useRef(0);

  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    year: '',
    kind: '',
    status: '',
    sort: 'rating',
    ...initialFilters,
  });

  const doSearch = useCallback(async (reset = true, pageOverride) => {
    const id = ++searchId.current;
    const currentPage = reset ? 1 : (pageOverride ?? page);

    if (reset) { setPage(1); setAnime([]); }
    setLoading(true);
    setError(null);

    try {
      const params = { limit: 20, page: currentPage };

      const filterParts = [];
      if (filters.search) {
        filterParts.push('name');
        params.name = filters.search;
      }
      if (filters.year) {
        filterParts.push('year');
        params.year = String(filters.year);
      }
      if (filters.status) {
        filterParts.push('publish_status');
        params.publish_status = filters.status;
      }
      if (filters.genre) {
        filterParts.push('genres');
        params.genres = filters.genre;
      }
      if (filters.kind) {
        filterParts.push('type');
        params.type = filters.kind;
      }

      if (filterParts.length) params.filter = filterParts.join(',');
      if (filters.sort) params.sorting = filters.sort;

      const response = await anilibriaApi.getTitleList(params);
      if (id !== searchId.current) return;

      const list = response?.data || [];
      if (reset) setAnime(list);
      else setAnime(prev => [...prev, ...list]);

      setHasMore(list.length >= 20);
    } catch (err) {
      if (id === searchId.current) setError(err.message);
    } finally {
      if (id === searchId.current) setLoading(false);
    }
  }, [filters, page]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', genre: '', year: '', kind: '', status: '', sort: 'rating' });
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => {
      const nextPage = prev + 1;
      doSearch(false, nextPage);
      return nextPage;
    });
  }, [doSearch]);

  return {
    anime, loading, error, filters, page, hasMore,
    updateFilters, resetFilters, doSearch, loadMore,
  };
};

export default useSearch;
