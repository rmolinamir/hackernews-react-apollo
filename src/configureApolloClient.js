
// Importing the required dependencies from the installed packages.
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
// This middleware will be invoked every time ApolloClient sends a request to the server. Apollo Links allow you
// to create middlewares that let you modify requests before they are sent to the server.
import { setContext } from 'apollo-link-context';
// When using Apollo, you need to configure your ApolloClient with information about the
// subscriptions endpoint.
// This is done by adding another ApolloLink to the Apollo middleware chain.
// This time, it’s the WebSocketLink from the apollo-link-ws package.
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

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

// Create a new WebSocketLink that represents the WebSocket connection. Use split for proper
// “routing” of the requests and update the constructor call of ApolloClient.
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
});

// You’re instantiating a WebSocketLink that knows the subscriptions endpoint. The subscriptions endpoint in
// this case is similar to the HTTP endpoint, except that it uses the ws instead of http protocol. Notice
// that you’re also authenticating the websocket connection with the user’s token that you retrieve from
// localStorage.
// 
// split is used to “route” a request to a specific middleware link. It takes three arguments, the first
// one is a test function which returns a boolean. The remaining two arguments are again of type ApolloLink.
// If test returns true, the request will be forwarded to the link passed as the second argument. If false,
// to the third one (like a ternary operator).
// 
// In your case, the test function is checking whether the requested operation is a subscription. If this
// is the case, it will be forwarded to the wsLink, otherwise (if it’s a query or mutation), the
// authLink.concat(httpLink) will take care of it.

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
);

// Instantiate ApolloClient by passing in the httpLink and a new instance of an InMemoryCache.
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
