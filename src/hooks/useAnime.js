import { useQuery } from '@apollo/client';
import { GET_TRENDING_ANIME, GET_POPULAR_ANIME, GET_ANIME_BY_ID, GET_SEASONAL_ANIME, GET_ANIME_CHARACTERS } from '../api/queries';

export const useTrendingAnime = (options = {}) => {
  return useQuery(GET_TRENDING_ANIME, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
};

export const usePopularAnime = (options = {}) => {
  return useQuery(GET_POPULAR_ANIME, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
};

export const useAnimeById = (id, options = {}) => {
  return useQuery(GET_ANIME_BY_ID, {
    variables: { id },
    skip: !id,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
};

export const useSeasonalAnime = (season, seasonYear, options = {}) => {
  return useQuery(GET_SEASONAL_ANIME, {
    variables: { season, seasonYear },
    notifyOnNetworkStatusChange: true,
    ...options,
  });
};

export const useAnimeCharacters = (id, options = {}) => {
  return useQuery(GET_ANIME_CHARACTERS, {
    variables: { id },
    skip: !id,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
};
