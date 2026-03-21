import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_ANIME, SEARCH_WITH_SORT, GET_ANIME_GENRES } from '../api/queries';

export const useSearch = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    year: null,
    type: null,
    status: null,
    sort: null,
    season: null,
    ...initialFilters,
  });

  const { data: genresData } = useQuery(GET_ANIME_GENRES);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      genre: '',
      year: null,
      type: null,
      status: null,
      sort: null,
      season: null,
    });
  }, []);

  const queryVariables = useMemo(() => ({
    search: filters.search || null,
    genre: filters.genre || null,
    year: filters.year || null,
    type: filters.type || null,
    status: filters.status || null,
    sort: filters.sort || null,
    season: filters.season || null,
  }), [filters.search, filters.genre, filters.year, filters.type, filters.status, filters.sort, filters.season]);

  const hasSortOrSeason = filters.sort || filters.season;
  const query = hasSortOrSeason ? SEARCH_WITH_SORT : SEARCH_ANIME;
  const { data, loading, error, refetch } = useQuery(query, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
  });

  return {
    anime: data?.Page?.media || [],
    genres: genresData?.GenreCollection || [],
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  };
};