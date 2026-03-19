import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.anilist.co',
  }),
  cache: new InMemoryCache(),
});

export default client;
