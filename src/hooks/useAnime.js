import { useQuery } from '@tanstack/react-query';
import { anilibriaApi } from '../api/anilibria';

const staleTime = 5 * 60 * 1000;
const cacheTime = 10 * 60 * 1000;

export const useTrendingAnime = (options = {}) => {
  return useQuery({
    queryKey: ['trending'],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'rating', limit: 20 }),
    select: (data) => data?.data || [],
    staleTime,
    cacheTime,
    ...options
  });
};

export const usePopularAnime = (options = {}) => {
  return useQuery({
    queryKey: ['popular'],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'popularity', limit: 20 }),
    select: (data) => data?.data || [],
    staleTime,
    cacheTime,
    ...options
  });
};

export const useSeasonalAnime = (year = null, season = null, options = {}) => {
  return useQuery({
    queryKey: ['seasonal', year, season],
    queryFn: () => {
      const params = { limit: 20 };
      if (year) {
        params.filter = 'year';
        params.year = String(year);
      }
      if (season) {
        params.filter = (params.filter ? params.filter + ',' : '') + 'season';
        params.season = season;
      }
      return anilibriaApi.getTitleList(params);
    },
    select: (data) => data?.data || [],
    staleTime,
    cacheTime,
    enabled: !!year || !!season,
    ...options
  });
};

export const useOngoingAnime = (options = {}) => {
  return useQuery({
    queryKey: ['ongoing'],
    queryFn: () => anilibriaApi.getTitleOngoing(),
    select: (data) => data?.data || [],
    staleTime,
    cacheTime,
    ...options
  });
};

export const useRecentlyReleased = (options = {}) => {
  return useQuery({
    queryKey: ['recent'],
    queryFn: () => anilibriaApi.getTitleUpdates(20),
    select: (data) => data?.data || [],
    staleTime,
    cacheTime,
    ...options
  });
};

export const useAnimeById = (code, options = {}) => {
  return useQuery({
    queryKey: ['anime', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    select: (data) => data,
    staleTime,
    cacheTime,
    enabled: !!code,
    ...options
  });
};

export const useAnimeCharacters = (code, options = {}) => {
  return useQuery({
    queryKey: ['characters', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    select: () => [],
    staleTime,
    cacheTime,
    enabled: !!code,
    ...options
  });
};

export const useSimilarAnime = (code, options = {}) => {
  return useQuery({
    queryKey: ['similar', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    select: () => [],
    staleTime,
    cacheTime,
    enabled: !!code,
    ...options
  });
};

export const useRelatedAnime = (code, options = {}) => {
  return useQuery({
    queryKey: ['related', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    select: () => [],
    staleTime,
    cacheTime,
    enabled: !!code,
    ...options
  });
};

export default {
  useTrendingAnime,
  usePopularAnime,
  useSeasonalAnime,
  useOngoingAnime,
  useRecentlyReleased,
  useAnimeById,
  useAnimeCharacters,
  useSimilarAnime,
  useRelatedAnime,
};
