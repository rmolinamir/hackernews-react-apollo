// Libraries
import React from 'react';
import { useQuery } from '@apollo/react-hooks';

// Dependencies
import queries from 'graphql/queries';
import updateCacheAfterVote from 'helpers/updateCacheAfterVote';

// Components
import Link from 'components/Link';

/**
 * Let’s understand what’s going on here! You’re using the <Query /> component as always but
 * now you’re using subscribeToMore received as prop into the component’s render prop function.
 * Calling _subscribeToNewLinks with its respective subscribeToMore function you make sure that
 * the component actually subscribes to the events. This call opens up a websocket connection to
 * the subscription server.
 * @function subscribeToNewLinks
 * @param {function} subscribeToMore - Apollo subscribeToMore function from useQuery.
 * @return {function} unsubscribe - Apollo unsubscribe function.
 */
async function subscribeToNewLinks(subscribeToMore) {
  /**
   * You’re passing two arguments to subscribeToMore:
   * 
   *    document:    This represents the subscription query itself. In your case,
   *                 the subscription will fire every time a new link is created.
   * 
   *    updateQuery: Similar to cache update prop, this function allows you to
   *                 determine how the store should be updated with the information
   *                 that was sent by the server after the event occurred. In fact, it
   *                 follows exactly the same principle as a Redux reducer: It takes as
   *                 arguments the previous state (of the query that subscribeToMore was called on)
   *                 and the subscription data that’s sent by the server. You can then determine how
   *                 to merge the subscription data into the existing state and return the updated data.
   *                 All you’re doing inside updateQuery is retrieving the new link from the received
   *                 subscriptionData, merging it into the existing list of links and returning the result
   *                 of this operation.
   */
  const unsubscribe = subscribeToMore({
    document: queries.NEW_LINKS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data || !prev) return prev;
      const { newLink } = subscriptionData.data;
      const exists = prev.feed.links.find(({ id }) => id === newLink.id);
      if (exists) return prev;
      const newLinks = [...prev.feed.links, newLink];
      return Object.assign({}, prev, {
        feed: {
          links: newLinks,
          count: newLinks.length,
          __typename: prev.feed.__typename,
        }
      });
    }
  });
  return unsubscribe;
}

function subscribeToNewVotes(subscribeToMore) {
  const unsubscribe = subscribeToMore({
    document: queries.NEW_VOTES_SUBSCRIPTION,
  });
  return unsubscribe;
}

export default function LinkList() {
  const { loading, error, data, subscribeToMore } = useQuery(queries.FEED_QUERY);

  React.useEffect(() => {
    const unsubscribeToNewLinks = subscribeToNewLinks(subscribeToMore);
    const unsubscribeToNewVotes = subscribeToNewVotes(subscribeToMore);
    return () => {
      typeof unsubscribeToNewLinks === 'function' && unsubscribeToNewLinks();
      typeof unsubscribeToNewVotes === 'function' && unsubscribeToNewVotes();
    };
  }, [subscribeToMore]);

  if (loading) return (
    <div data-test="component-link-list">
      <div data-test="loading">Loading...</div>
    </div>
  );

  if (error) return (
    <div data-test="component-link-list">
      <div data-test="error">Error!</div>
    </div>
  );
  
  const linksToRender = data.feed.links;
  return (
    <div data-test="component-link-list">
      {linksToRender.map((link, index) => (
        <Link
          data-test="link"
          key={link.id}
          link={link}
          index={index}
          updateStoreAfterVote={updateCacheAfterVote}
        />
      ))}
    </div>
  );
}
