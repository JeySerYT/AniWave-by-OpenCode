import { useQuery } from '@tanstack/react-query';
import { anilibriaApi } from '../api/anilibria';

const staleTime = 5 * 60 * 1000;
const gcTime = 10 * 60 * 1000;

export const useTrendingAnime = (options = {}) => {
  const query = useQuery({
    queryKey: ['trending'],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'RATING_DESC', limit: 20 }),
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
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'RATING_DESC', limit: 20 }),
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
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'RATING_DESC', limit: 20, seasons: season, from_year: year, to_year: year }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useOngoingAnime = (options = {}) => {
  return useQuery({
    queryKey: ['ongoing'],
    queryFn: () => anilibriaApi.getTitleList({
      sorting: 'RATING_DESC',
      limit: 20,
      publish_statuses: 'IS_ONGOING'
    }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    ...options
  });
};

export const useRecentlyReleased = (options = {}) => {
  return useQuery({
    queryKey: ['recent'],
    queryFn: () => anilibriaApi.getTitleList({
      sorting: 'FRESH_AT_DESC',
      limit: 20
    }),
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

export const useYearAnime = (year, options = {}) => {
  const query = useQuery({
    queryKey: ['year', year],
    queryFn: () => anilibriaApi.getTitleList({ sorting: 'RATING_DESC', limit: 30, from_year: year, to_year: year }),
    select: (data) => data?.data || [],
    staleTime,
    gcTime,
    enabled: !!year,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};

export const useFranchise = (releaseId, options = {}) => {
  const query = useQuery({
    queryKey: ['franchise', releaseId],
    queryFn: () => releaseId ? anilibriaApi.getFranchises(releaseId) : null,
    staleTime,
    gcTime,
    enabled: !!releaseId,
    ...options
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
};
