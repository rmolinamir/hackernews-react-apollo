
// Importing the required dependencies from the installed packages.
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

// Create the httpLink that will connect your ApolloClient instance with the GraphQL API,
// the GraphQL server will be running on http://localhost:4000.
const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

// Instantiate ApolloClient by passing in the httpLink and a new instance of an InMemoryCache.
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
