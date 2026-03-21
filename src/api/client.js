import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Media: {
      keyFields: ['id'],
    },
  },
});

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.anilist.co',
  }),
  cache,
});

export default client;
