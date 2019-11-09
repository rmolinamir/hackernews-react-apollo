// Libraries
import React from 'react';

// Components
import { Switch, Route } from 'react-router-dom';
import Header from 'components/Header';
import LinkList from 'components/LinkList';
import CreateLink from 'components/CreateLink';

// Local Dependencies
import './App.css';

export default function App() {
  return (
    <div
      data-test="component-app"
      className="center w85"
    >
      <Header />
      <div className="ph3 pv1 background-gray">
        <Switch>
          <Route exact path="/" component={LinkList} />
          <Route exact path="/create" component={CreateLink} />
        </Switch>
      </div>
    </div>
  );
}
