// Libraries
import { useHistory, useParams } from 'react-router-dom';

// Dependencies
import { LINKS_PER_PAGE } from '../../constants';
import queries from 'graphql/queries';

/**
 * The update function that you’re passing as prop to the <Mutation /> component will be
 * called directly after the server returned the response. It receives the payload of the
 * mutation (data) and the current cache (store) as arguments. You can then use this input
 * to determine a new state for the cache.
 * @function updateCacheAfterVote
 * @param {DataProxy} store - Apollo DataProxy instance from `update` mutation method.
 * @param {object} voteData - Network response payload from upvote link mutation.
 * @param {number} linkId - Upvoted link id.
 */
export default function updateCacheAfterVote(store, voteData, linkId, query = queries.FEED_QUERY) {
  // Fetch current cache from the Apollo store
  const data = store.readQuery({ query });
  // Find the voted link
  const votedLink = data.feed.links.find(link => link.id === linkId);
  // Overwrite the previous votes with the new ones
  votedLink.votes = voteData.link.votes;
  // Write a new query with the new data including the recent upvoted link
  store.writeQuery({ query, data });
}

export function useUpdateCacheAfterVote() {
  const history = useHistory();
  const params = useParams();

  const isNewPage = history.location.pathname.includes('new');
  const page = parseInt(params.page, 10);

  const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
  const first = isNewPage ? LINKS_PER_PAGE : 100
  const orderBy = isNewPage ? 'createdAt_DESC' : null
  const variables = { skip, first, orderBy };

  return (store, voteData, linkId, query = queries.FEED_QUERY) => {
    // Fetch current cache from the Apollo store
    const data = store.readQuery({ query, variables });
    // Find the voted link
    const votedLink = data.feed.links.find(link => link.id === linkId);
    // Overwrite the previous votes with the new ones
    votedLink.votes = voteData.link.votes;
    // Write a new query with the new data including the recent upvoted link
    store.writeQuery({ query, data });
  }
}