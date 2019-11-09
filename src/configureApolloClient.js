
// Importing the required dependencies from the installed packages.
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
// This middleware will be invoked every time ApolloClient sends a request to the server. Apollo Links allow you
// to create middlewares that let you modify requests before they are sent to the server.
import { setContext } from 'apollo-link-context';

// Dependencies
import { AUTH_TOKEN } from './constants';

// Create the httpLink that will connect your ApolloClient instance with the GraphQL API,
// the GraphQL server will be running on http://localhost:4000.
const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

// Configuring Apollo with the authentication token.
// Token gets attached to all requests that are sent to the API.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      // Adding the auth header:
      authorization: token ? `Bearer ${token}` : '',
    },
  }
});

// Instantiate ApolloClient by passing in the httpLink and a new instance of an InMemoryCache.
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
