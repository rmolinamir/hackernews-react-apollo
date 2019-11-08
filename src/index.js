// Libraries
import React from 'react';
import ReactDOM from 'react-dom';
// Importing the required dependencies from the installed packages.
import { ApolloProvider } from 'react-apollo';

// Dependencies
import { client } from 'configureApolloClient';
import './index.css';
import * as serviceWorker from './serviceWorker';

// Components
import App from './App';

// Finally you render the root component of your React app. The App is wrapped with the higher-order
// component ApolloProvider that gets passed the client as a prop.
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
