import { useQuery } from '@tanstack/react-query';
import { anilibriaApi } from '../api/anilibria';

const staleTime = 5 * 60 * 1000;
const gcTime = 10 * 60 * 1000;

export const useTrendingAnime = (options = {}) => {
  const query = useQuery({
    queryKey: ['trending'],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'rating', limit: 20 }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const usePopularAnime = (options = {}) => {
  const query = useQuery({
    queryKey: ['popular'],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'popularity', limit: 20 }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useSeasonalAnime = (year = null, season = null, options = {}) => {
  const query = useQuery({
    queryKey: ['seasonal', year, season],
    queryFn: () => anilibriaApi.getTitleList({ limit: 20, page: 2 }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    enabled: !!year || !!season,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useOngoingAnime = (options = {}) => {
  return useQuery({
    queryKey: ['ongoing'],
    queryFn: () => anilibriaApi.getTitleList({ limit: 20, page: 3 }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
};

export const useRecentlyReleased = (options = {}) => {
  return useQuery({
    queryKey: ['recent'],
    queryFn: () => anilibriaApi.getTitleList({ limit: 20, page: 4 }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
};

export const useAnimeById = (code, options = {}) => {
  const query = useQuery({
    queryKey: ['anime', code],
    queryFn: () => code ? anilibriaApi.getReleaseById(code) : null,
    staleTime,
    gcTime,
    enabled: !!code,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useAnimeCharacters = (code, options = {}) => {
  const query = useQuery({
    queryKey: ['characters', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    staleTime,
    gcTime,
    enabled: !!code,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useSimilarAnime = (code, options = {}) => {
  const query = useQuery({
    queryKey: ['similar', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    staleTime,
    gcTime,
    enabled: !!code,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useRelatedAnime = (code, options = {}) => {
  const query = useQuery({
    queryKey: ['related', code],
    queryFn: () => code ? anilibriaApi.getTitle(code) : null,
    staleTime,
    gcTime,
    enabled: !!code,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
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
