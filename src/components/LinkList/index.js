// Libraries
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router-dom';

// Dependencies
import { useUpdateCacheAfterVote } from 'helpers/updateCacheAfterVote';
import { LINKS_PER_PAGE } from '../../constants';
import queries from 'graphql/queries';

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
      const newLinks = [newLink, ...prev.feed.links];
      // Removing the last item from the Array if there are more than
      // LINKS_PER_PAGE links:
      if (newLinks.length > LINKS_PER_PAGE) {
        newLinks.pop();
      }
      return Object.assign({}, prev, {
        feed: {
          ...prev.feed,
          links: newLinks,
          count: newLinks.length,
          // __typename: prev.feed.__typename,
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

/**
 * The query now accepts arguments that we’ll use to implement pagination and ordering.
 * skip defines the offset where the query will start. If you passed a value of e.g. 10
 * for this argument, it means that the first 10 items of the list will not be included in
 * the response. first then defines the limit, or how many elements, you want to load from
 * that list. Say, you’re passing the 10 for skip and 5 for first, you’ll receive items 10
 * to 15 from the list. orderBy defines how the returned list should be sorted.
 * @function getQueryVariables
 * @return {object} - Feed query variables.
 */
function getQueryVariables(history, params) {
  const isAtNewPage = history.location.pathname.includes('new');
  const page = parseInt(params.page, 10);

  const skip = isAtNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
  const first = isAtNewPage ? LINKS_PER_PAGE : 100;
  const orderBy = isAtNewPage ? 'createdAt_DESC' : null;
  return { first, skip, orderBy };
}

/**
 * For the newPage, you’ll simply return all the links returned by the query. That’s
 * logical since here you don’t have to make any manual modifications to the list that
 * is to be rendered. If the user loaded the component from the /top route, you’ll
 * sort the list according to the number of votes and return the top 10 links.
 * @function getLinksToRender
 * @param {object} data - Apollo feed query data.
 * @param {object} history - react-router-dom history object.
 */
function getLinksToRender(data, history) {
  const isNewPage = history.location.pathname.includes('new');
  if (isNewPage) {
    return data.feed.links;
  }
  const rankedLinks = data.feed.links.slice();
  rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
  return rankedLinks;
}

/**
 * Functionality for the Next button.
 * @param {object} data - Apollo feed query data.
 * @param {object} history - react-router-dom history object.
 * @param {object} params - react-router-dom params object.
 */
function nextPage(data, history, params) {
  const page = parseInt(params.page, 10)
  if (page <= data.feed.count / LINKS_PER_PAGE) {
    const nextPage = page + 1
    history.push(`/new/${nextPage}`)
  }
}

/**
 * Functionality for the Previou button.
 * @param {object} data - Apollo feed query data.
 * @param {object} history - react-router-dom history object.
 * @param {object} params - react-router-dom params object.
 */
function previousPage(history, params) {
  const page = parseInt(params.page, 10)
  if (page > 1) {
    const previousPage = page - 1
    history.push(`/new/${previousPage}`)
  }
}

export default function LinkList() {
  const history = useHistory();
  const params = useParams();
  const { loading, error, data, subscribeToMore } = useQuery(
    queries.FEED_QUERY,
    {
      variables: getQueryVariables(history, params)
    }
  );
  const updateCacheAfterVote = useUpdateCacheAfterVote();

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
  
  const linksToRender = getLinksToRender(data, history);
  const isNewPage = history.location.pathname.includes('new')
  const pageIndex = params.page
    ? (params.page - 1) * LINKS_PER_PAGE
    : 0

  return (
    <div data-test="component-link-list">
      {linksToRender.map((link, index) => (
        <Link
          data-test="link"
          key={link.id}
          link={link}
          index={index + pageIndex}
          updateStoreAfterVote={updateCacheAfterVote}
        />
      ))}
      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={() => previousPage(history, params)}>
            Previous
          </div>
          <div className="pointer" onClick={() => nextPage(data, history, params)}>
            Next
          </div>
        </div>
      )}
    </div>
  );
}
