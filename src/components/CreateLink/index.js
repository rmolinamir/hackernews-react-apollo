// Libraries
import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router';

// Deppendencies
import queries from 'graphql/queries';

const actionTypes = {
  SET_DESCRIPTION: 'SET_DESCRIPTION',
  SET_URL: 'SET_URL',
  HANDLE_SUBMIT: 'HANDLE_SUBMIT',
}

export const initialState = {
  description: '',
  url: '',
}

export function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch(type) {
    case actionTypes.SET_DESCRIPTION:
      return {
        ...state,
        description: payload,
      };
    case actionTypes.SET_URL:
      return {
        ...state,
        url: payload,
      };
    case actionTypes.HANDLE_SUBMIT:
      return {
        description: '',
        url: '',
      };
    default:
      return state;
  }
}

export default function CreateLink() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [createLink] = useMutation(
    queries.POST_MUTATION,
    {
      variables: state,
      onCompleted: handleOnComplete,
    },
  );

  const history = useHistory();

  function handleDescriptionOnChange(event) {
    event.preventDefault();
    dispatch({
      type: actionTypes.SET_DESCRIPTION,
      payload: event.target.value,
    });
  }

  function handleUrlOnChange(event) {
    event.preventDefault();
    dispatch({
      type: actionTypes.SET_URL,
      payload: event.target.value,
    });
  }

  function handleOnComplete() {
    history.push('/');
  }

  return (
    <div data-test="component-create-link">
      <div className="flex flex-column mt3">
        <input
          data-test="description-input"
          className="mb2"
          value={state.description}
          onChange={handleDescriptionOnChange}
          type="text"
          placeholder="A description for the link."
        />
        <input
          data-test="url-input"
          className="mb2"
          value={state.url}
          onChange={handleUrlOnChange}
          type="text"
          placeholder="The URL for the link."
        />
      </div>
      <button
        data-test="submit-button"
        type="button"
        onClick={() => {
          createLink({
            // Read the current state of the results of the FEED_QUERY. Then you insert
            // the newest link at beginning and write the query results back to the store
            update: (store, { data: { post } }) => {
              const data = store.readQuery({ query: queries.FEED_QUERY });
              data.feed.links.unshift(post);
              store.writeQuery({
                query: queries.FEED_QUERY,
                data: data,
              });
            }
          });
        }}
      >
        Submit
      </button>
    </div>
  );
}
