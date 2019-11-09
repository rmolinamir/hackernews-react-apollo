// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useMutation } from '@apollo/react-hooks';

// Dependencies
import queries from 'graphql/queries';
import { AUTH_TOKEN } from '../../constants';

/**
 * Worker function to determine time difference in hours between present time
 * and `startTime` param.
 * @function timeDifferenceForDate
 * @param {string} startTime - Start time date.
 * @return {number} - Hours.
 */
function timeDifferenceForDate(startTime) {
  const now = moment(moment.now());
  const duration = moment.duration(now.diff(moment(startTime)));
  const hours = duration.asHours();
  return hours.toFixed(0);
}

export default function Link(props) {
  const {
    link: { id, description, url, votes, createdAt, postedBy },
    index,
    updateStoreAfterVote,
  } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);
  const [upvoteLink] = useMutation(
    queries.VOTE_MUTATION,
    {
      variables: {
        linkId: id,
      },
    }
  )
  return (
    <div
      data-test="component-link"
      className="flex mt2 items-start"
    >
      <div className="flex items-center">
        <span className="gray">{index + 1}.</span>
        {authToken && (
          <div
            data-test="upvote-button"
            className="ml1 gray f11"
            onClick={() => {
              // One cool thing about Apollo is that you can manually control the contents of the cache.
              // This is really handy, especially after a mutation was performed. It allows to precisely
              // determine how you want the cache to be updated.
              // Here, you’ll use it to make sure the UI displays the correct number of votes right after
              // the vote mutation was performed.
              upvoteLink({
                update: (store, { data }) => {
                  updateStoreAfterVote(store, data.vote, id);
                }
              });
            }}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {`${description} (${url})`}
        </div>
        <div className="f6 lh-copy gray">
          {`${votes.length} votes | by ${postedBy ? postedBy.name : 'Unknown'} - ${timeDifferenceForDate(createdAt)} hours ago`}
        </div>
      </div>
    </div>
  )
}

Link.propTypes = {
  link: PropTypes.instanceOf(Object).isRequired,
  index: PropTypes.number.isRequired,
  updateStoreAfterVote: PropTypes.func.isRequired,
}
