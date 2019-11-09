// Libraries
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import wait from 'waait';
import { useMutation } from '@apollo/react-hooks';

// Dependencies
import { findByTestAttr, Proxy } from 'test/utils';
import queries from 'graphql/queries';

// Components
import Login, { reducer, initialState } from '.';

const useMutationReturnMock = jest.fn();
jest.mock("react-router", () => ({
  useHistory: jest.fn().mockReturnValue({ push() {} }),
}));
jest.doMock("@apollo/react-hooks", () => ({
  useMutation: jest.fn(useMutation).mockReturnValue([useMutationReturnMock]),
}));

const registerMocks = [
  {
    request: {
      query: queries.SIGNUP_MUTATION,
      variables: {
        name: 'test',
        email: 'test@email.test',
        password: 'password',
      },
    },
    result: {
      data: {
        signup: {
          token: 'token',
        },
      },
    },
  },
];

const loginMocks = [
  {
    request: {
      query: queries.LOGIN_MUTATION,
      variables: {
        email: 'test@email.test',
        password: 'password',
      },
    },
    result: {
      data: {
        login: {
          token: 'token',
        },
      },
    },
  }
];

const reactUseReducer = React.useReducer;

function setup(mocks = loginMocks) {
  const wrapper = mount(
    <Proxy mocks={mocks}>
      <Login />
    </Proxy>
  );
  return wrapper;
}

describe('render', () => {
  let wrapper;
  let state = { ...initialState };
  let dispatch;
  beforeEach(() => {
    wrapper = setup();
    // Mocking `useReducer` for the test
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = () => [state, dispatch];
  });

  afterEach(() => {
    jest.clearAllMocks();
    // React.useReducer = reactUseReducer;
    React.useReducer = reactUseReducer;
  });

  it('renders without problems', () => {
    const loginComponent = findByTestAttr(wrapper, 'component-login');
    expect(loginComponent.exists()).toBe(true);
  });

  it('renders auth view button', () => {
    const authViewButton = findByTestAttr(wrapper, 'auth-view-button');
    expect(authViewButton.exists()).toBe(true);
  });

  it('renders auth submit button', () => {
    const authSubmitButton = findByTestAttr(wrapper, 'auth-submit-button');
    expect(authSubmitButton.exists()).toBe(true);
  });

  it('initial view is login', () => {
    expect(state.login).toBe(true);
  });
});

describe('clicking the auth view button correctly switches views', () => {
  let wrapper;
  let state = { ...initialState };
  let dispatch;
  beforeEach(() => {
    // Mocking `useReducer` for the test
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = () => [state, dispatch];
    wrapper = setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // React.useReducer = reactUseReducer;
    React.useReducer = reactUseReducer;
    // Restoring state
    state = { ...initialState };
  });

  it('clicking the auth view button once switches to register', () => {
    const authViewButton = findByTestAttr(wrapper, 'auth-view-button');
    // Switching to register
    authViewButton.simulate('click');
    expect(state.login).toBe(false);
  });

  it('clicking the auth view button twice goes back to login', () => {
    const authViewButton = findByTestAttr(wrapper, 'auth-view-button');
    // Switching to register
    authViewButton.simulate('click');
    expect(state.login).toBe(false);
    // Switching back to login
    authViewButton.simulate('click');
    expect(state.login).toBe(true);
  });
});

describe('login view works correctly', () => {
  let wrapper;
  let state = { ...initialState };
  let dispatch;
  beforeEach(() => {
    // Mocking `useReducer` for the test
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = () => [state, dispatch];
    wrapper = setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // React.useReducer = reactUseReducer;
    React.useReducer = reactUseReducer;
    // Restoring state
    state = { ...initialState };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  })

  it('email-input `onChange` calls dispatch', () => {
    const emailInput = findByTestAttr(wrapper, 'email-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.email }, preventDefault() {} };
    emailInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('email-input `onChange` updates state', () => {
    const emailInput = findByTestAttr(wrapper, 'email-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.email }, preventDefault() {} };
    emailInput.simulate('change', mockEvent);
    expect(state.email).toBe(mockEvent.target.value);
  });

  it('password-input `onChange` calls dispatch', () => {
    const passwordInput = findByTestAttr(wrapper, 'password-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.password }, preventDefault() {} };
    passwordInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('password-input `onChange` updates state', () => {
    const passwordInput = findByTestAttr(wrapper, 'password-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.password }, preventDefault() {} };
    passwordInput.simulate('change', mockEvent);
    expect(state.password).toBe(mockEvent.target.value);
  });
});

describe('register view works correctly', () => {
  let wrapper;
  let state = { ...initialState, login: false };
  let dispatch;
  beforeEach(() => {
    // Mocking `useReducer` for the test
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = () => [state, dispatch];
    wrapper = setup(registerMocks);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // React.useReducer = reactUseReducer;
    React.useReducer = reactUseReducer;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  })

  it('name-input `onChange` calls dispatch', () => {
    const emailInput = findByTestAttr(wrapper, 'name-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.name }, preventDefault() {} };
    emailInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('name-input `onChange` updates state', () => {
    const nameInput = findByTestAttr(wrapper, 'name-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.name }, preventDefault() {} };
    nameInput.simulate('change', mockEvent);
    expect(state.name).toBe(mockEvent.target.value);
  });

  it('email-input `onChange` calls dispatch', () => {
    const emailInput = findByTestAttr(wrapper, 'email-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.email }, preventDefault() {} };
    emailInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('email-input `onChange` updates state', () => {
    const emailInput = findByTestAttr(wrapper, 'email-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.email }, preventDefault() {} };
    emailInput.simulate('change', mockEvent);
    expect(state.email).toBe(mockEvent.target.value);
  });

  it('password-input `onChange` calls dispatch', () => {
    const passwordInput = findByTestAttr(wrapper, 'password-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.password }, preventDefault() {} };
    passwordInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('password-input `onChange` updates state', () => {
    const passwordInput = findByTestAttr(wrapper, 'password-input');
    const mockEvent = { target: { value : loginMocks[0].request.variables.password }, preventDefault() {} };
    passwordInput.simulate('change', mockEvent);
    expect(state.password).toBe(mockEvent.target.value);
  });
});
