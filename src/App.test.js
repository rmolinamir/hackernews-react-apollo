// Libraries
import React from 'react';
import ReactDOM from 'react-dom';

// Dependencies
import { client } from 'configureApolloClient';

// Components
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
    , div
  );
  ReactDOM.unmountComponentAtNode(div);
});
