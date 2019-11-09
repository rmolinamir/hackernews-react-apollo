// Libraries
import React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';

// Dependencies
import queries from 'graphql/queries';
import updateCacheAfterVote from 'helpers/updateCacheAfterVote';

// Components
import Link from 'components/Link';

const actionTypes = {
  SET_LINKS: 'SET_LINKS',
  SET_FILTER: 'SET_FILTER',
}

export function reducer(state, action) {
  const { type, payload } = action;
  switch(type) {
    case actionTypes.SET_FILTER:
      return {
        ...state,
        filter: payload,
      }
    case actionTypes.SET_LINKS:
      return {
        ...state,
        filter: '',
        links: payload,
      }
    default:
      return state;
  }
}

export const initialState = {
  links: [],
  filter: '',
}

export default function Search() {
  const [{ links, filter }, dispatch] = React.useReducer(reducer, initialState);
  const [loadFilteredLinks, { loading }] = useLazyQuery(
    queries.FEED_SEARCH_QUERY,
    {
      onCompleted: data=> {
        const { links } = data.feed;
        dispatch({
          type: actionTypes.SET_LINKS,
          payload: links,
        });
      }
    }
  );

  function handleOnChange(event) {
    dispatch({
      type: actionTypes.SET_FILTER,
      payload: event.target.value,
    });
  }

  function handleOnSubmit() {
    loadFilteredLinks({
      variables: {
        filter
      },
    })
  }

  if (loading) {
    return (
      <div
        data-test="component-search"
        className="flex flex-column pt3 pb3"
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      data-test="component-search"
      className="flex flex-column pt3 pb3"
    >
      <div>
        <input
          data-test="search-input"
          type='text'
          onChange={handleOnChange}
        />
        <button
          data-test="submit-button"
          type="button"
          className="ml1"
          onClick={handleOnSubmit}
          // onClick={loadFilteredLinks}
        >
          search
        </button>
      </div>
      {links.map((link, index) => (
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
