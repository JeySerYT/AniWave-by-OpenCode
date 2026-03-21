import { gql } from '@apollo/client';

export const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime {
    Page(perPage: 16) {
      media(type: ANIME, sort: TRENDING_DESC) {
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
        format
        seasonYear
        trailer {
          id
          site
        }
      }
    }
  }
`;

export const GET_POPULAR_ANIME = gql`
  query GetPopularAnime {
    Page(perPage: 16) {
      media(type: ANIME, sort: POPULARITY_DESC) {
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
      }
    }
  }
`;

export const GET_ANIME_BY_ID = gql`
  query GetAnimeById($id: Int) {
    Media(id: $id, type: ANIME) {
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
      season
      seasonYear
      format
      duration
      studios(isMain: true) {
        nodes {
          name
        }
      }
      source
      countryOfOrigin
      synonyms
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        episode
        airingAt
      }
      trailer {
        id
        site
      }
      tags {
        name
        rank
      }
      relations {
        edges {
          node {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              medium
            }
            averageScore
            episodes
            type
          }
          relationType
        }
      }
    }
  }
`;

export const SEARCH_ANIME = gql`
  query SearchAnime($search: String, $genre: String, $year: Int, $type: MediaType, $status: MediaStatus) {
    Page(perPage: 20) {
      media(
        type: ANIME
        search: $search
        genre: $genre
        seasonYear: $year
        format: $type
        status: $status
        sort: SEARCH_MATCH
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

export const GET_ANIME_GENRES = gql`
  query GetAnimeGenres {
    GenreCollection
  }
`;

export const GET_SEASONAL_ANIME = gql`
  query GetSeasonalAnime($season: MediaSeason, $seasonYear: Int) {
    Page(perPage: 20) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
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

export const GET_ANIME_BY_STATUS = gql`
  query GetAnimeByStatus($status: MediaStatus) {
    Page(perPage: 16) {
      media(
        type: ANIME
        status: $status
        sort: POPULARITY_DESC
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

export const GET_ANIME_BY_YEAR = gql`
  query GetAnimeByYear($year: Int) {
    Page(perPage: 16) {
      media(
        type: ANIME
        seasonYear: $year
        sort: POPULARITY_DESC
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
        seasonYear
      }
    }
  }
`;

export const GET_ANIME_CHARACTERS = gql`
  query GetAnimeCharacters($id: Int) {
    Media(id: $id, type: ANIME) {
      characters(sort: ROLE, perPage: 12) {
        nodes {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
          role
        }
      }
    }
  }
`;

export const SEARCH_WITH_SORT = gql`
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
