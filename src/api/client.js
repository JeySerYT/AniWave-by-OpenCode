import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export const ANILIBRIA_BASE_URL = 'https://anilibria.top';

export const apiClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.anilist.co',
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Media: {
        keyFields: ['id'],
      },
    },
  }),
});

export default apiClient;
