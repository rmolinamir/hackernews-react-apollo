// Libraries
import React from 'react';

// Dependencies
import queries from 'graphql/queries';

// Components
import { Query } from "react-apollo";
import Link from 'components/Link';

export default function LinkList() {
  return (
    <div data-test="component-link-list">
      <Query query={queries.FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div data-test="loading">Loading...</div>;
          if (error) return <div data-test="error">Error!</div>;
          const linksToRender = data.feed.links;
          return linksToRender.map(link => (
            <Link
              data-test="link"
              key={link.id}
              link={link}
            />
          ))
        }}
      </Query>
    </div>
  );
}
