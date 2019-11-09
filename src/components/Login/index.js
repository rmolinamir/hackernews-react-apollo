
// Libraries
import React from 'react';
import { useHistory } from 'react-router';
import { useMutation } from '@apollo/react-hooks';

// Dependencies
import { AUTH_TOKEN } from '../../constants';
import queries from 'graphql/queries';

const actionTypes = {
  TOGGLE_LOGIN: 'TOGGLE_LOGIN',
  SET_NAME: 'SET_NAME',
  SET_EMAIL: 'SET_EMAIL',
  SET_PASSWORD: 'SET_PASSWORD',
}

export function reducer(state, action) {
  const { type, payload } = action;
  switch(type) {
    case actionTypes.TOGGLE_LOGIN:
      return {
        ...state,
        login: !state.login,
      }
    case actionTypes.SET_NAME:
      return {
        ...state,
        name: payload,
      }
    case actionTypes.SET_EMAIL:
      return {
        ...state,
        email: payload,
      }
    case actionTypes.SET_PASSWORD:
      return {
        ...state,
        password: payload,
      }
    default:
      return state;
  }
}

export const initialState = {
  login: true,
  email: '',
  password: '',
  name: '',
};

export default function Login() {
  const [
    { login, name, email, password },
    dispatch,
  ] = React.useReducer(reducer, initialState);

  const history = useHistory();

  function saveUserData(token) {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  function handleOnComplete(data) {
    const { token } = login ? data.login : data.singup;
    saveUserData(token);
    history.push('/');
  }

  // Sign up mutation
  const [signUp] = useMutation(
    queries.SIGNUP_MUTATION,
    {
      variables: { name, email, password },
      onCompleted: handleOnComplete,
    },
  );

  // Log in mutation
  const [logIn] = useMutation(
    queries.LOGIN_MUTATION,
    {
      variables: { email, password },
      onCompleted: handleOnComplete,
    },
  );

  return (
    <div data-test="component-login">
      <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
      <div className="flex flex-column">
        {/* Name Input */}
        {!login && (
          <input
            data-test="name-input"
            value={name}
            onChange={e => dispatch({ type: actionTypes.SET_NAME, payload: e.target.value })}
            type="text"
            placeholder="Your name"
          />
        )}
        {/* Email Input */}
        <input
            data-test="email-input"
          value={email}
          onChange={e => dispatch({ type: actionTypes.SET_EMAIL, payload: e.target.value })}
          type="text"
          placeholder="Your email address"
        />
        {/* Password Input */}
        <input
            data-test="password-input"
          value={password}
          onChange={e => dispatch({ type: actionTypes.SET_PASSWORD, payload: e.target.value })}
          type="password"
          placeholder="Choose a safe password"
        />
      </div>
      <div className="flex mt3">
        {/* Submit View Button */}
        <div
          data-test="auth-submit-button"
          className="pointer mr2 button"
          onClick={login ? logIn : signUp}
        >
          {login ? 'login' : 'create account'}
        </div>
        {/* Toggle View Button */}
        <div
          data-test="auth-view-button"
          className="pointer button"
          onClick={() => dispatch({ type: actionTypes.TOGGLE_LOGIN })}
        >
          {login
            ? 'need to create an account?'
            : 'already have an account?'}
        </div>
      </div>
    </div>
  )
}
