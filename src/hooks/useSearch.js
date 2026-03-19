import { useState, useCallback, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { SEARCH_ANIME, GET_ANIME_GENRES } from '../api/queries';

const SEARCH_WITH_SORT = gql`
  query SearchAnimeWithSort($search: String, $genre: String, $year: Int, $type: MediaType, $status: MediaStatus, $sort: MediaSort, $season: MediaSeason) {
    Page(perPage: 20) {
      media(
        type: ANIME
        search: $search
        genre: $genre
        seasonYear: $year
        format: $type
        status: $status
        sort: $sort
        season: $season
      ) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description(asHtml: false)
        genres
        averageScore
        episodes
        status
      }
    }
  }
`;

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

  const useQueryWithSort = () => {
    const hasSortOrSeason = filters.sort || filters.season;
    const query = hasSortOrSeason ? SEARCH_WITH_SORT : SEARCH_ANIME;
    return useQuery(query, {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
      skip: false,
    });
  };

  const { data, loading, error, refetch } = useQueryWithSort();

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