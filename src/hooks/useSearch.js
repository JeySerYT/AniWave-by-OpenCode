import { useState, useCallback, useRef } from 'react';
import { anilibriaApi } from '../api/anilibria';

const sortMap = {
  rating: 'RATING_DESC',
  popularity: 'RATING_DESC',
  updated_at: 'FRESH_AT_DESC',
};

export const useSearch = (initialFilters) => {
  const genreMapRef = useRef({});
  const genreMapLoadedRef = useRef(false);

  const ensureGenreMap = async () => {
    if (genreMapLoadedRef.current) return;
    try {
      const genres = await anilibriaApi.getGenres();
      if (Array.isArray(genres)) {
        const map = {};
        genres.forEach(g => { map[g.name] = g.id; });
        genreMapRef.current = map;
        genreMapLoadedRef.current = true;
      }
    } catch (e) {
      console.error('Failed to load genre map', e);
    }
  };

  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(
    initialFilters || { search: '', genre: '', year: '', status: '', sort: 'popularity' },
  );
  const pageRef = useRef(1);

  const buildApiParams = useCallback((f, page) => {
    const params = { limit: 20, page };

    if (f.search) params.search = f.search;

    if (f.genre && genreMapRef.current[f.genre]) {
      params.genres = String(genreMapRef.current[f.genre]);
    }

    if (f.year) {
      params.from_year = f.year;
      params.to_year = f.year;
    }

    if (f.status) {
      params.publish_statuses = f.status === 'ongoing' ? 'IS_ONGOING' : 'IS_NOT_ONGOING';
    }

    if (sortMap[f.sort]) {
      params.sorting = sortMap[f.sort];
    }

    return params;
  }, []);

  const doSearch = useCallback(async (f, reset = true) => {
    await ensureGenreMap();

    const page = reset ? 1 : pageRef.current + 1;
    if (reset) { setAnime([]); pageRef.current = 1; }
    setLoading(true);
    setError(null);

    try {
      const apiParams = buildApiParams(f, page);
      const response = await anilibriaApi.getTitleList(apiParams);
      const list = response?.data || [];
      const metaTotal = response?.meta?.pagination?.total || 0;

      if (reset) setAnime(list);
      else setAnime(prev => [...prev, ...list]);
      setTotal(metaTotal);
      if (!reset) pageRef.current = page;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildApiParams]);

  const updateFilters = useCallback((updates) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', genre: '', year: '', status: '', sort: 'popularity' });
  }, []);

  return {
    anime, loading, error, filters, total,
    updateFilters, resetFilters, doSearch,
  };
};

export default useSearch;
