// Libraries
import React from 'react';
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme';
import wait from 'waait';

// Dependencies
import { findByTestAttr, Proxy } from 'test/utils';
import queries from 'graphql/queries';

// Components
import CreateLink, { initialState, reducer } from '.';

// Original `useReducer` to clean up the mocked useReducer.
const reactUseReducer = React.useReducer;

const apolloMocks = [
  {
    request: {
      query: queries.POST_MUTATION,
      variables: {
        description: 'The best learning resource for GraphQL',
        url: 'www.howtographql.com',
      },
    },
    result: {
      data: {
        post: {
          id: '1',
          createdAt: '2019-11-07T04:19:17.219Z',
          description: 'The best learning resource for GraphQL',
          url: 'www.howtographql.com',
        },
      },
    },
  },
];

function setup(mocks = apolloMocks) {
  const wrapper = mount(
    <Proxy mocks={mocks}>
      <CreateLink />
    </Proxy>
  );
  return wrapper;
}

describe('renders', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  it('renders without errors', () => {
    const createLinkComponent = findByTestAttr(wrapper, 'component-create-link');
    expect(createLinkComponent.exists()).toBe(true);
  });

  it('renders description input', () => {
    const descriptionInput = findByTestAttr(wrapper, 'description-input');
    expect(descriptionInput.exists()).toBe(true);
  });

  it('renders url input', () => {
    const urlInput = findByTestAttr(wrapper, 'url-input');
    expect(urlInput.exists()).toBe(true);
  });

  it('renders submit button', () => {
    const submitButton = findByTestAttr(wrapper, 'submit-button');
    expect(submitButton.exists()).toBe(true);
  });
});

describe('controlled inputs set states correctly through the dispatcher', () => {
  let wrapper;
  let state = { ...initialState };
  let dispatch;
  beforeEach(() => {
    // Mocking `useReducer` for the test
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = () => [state, dispatch];
    // Setting up wrapper
    wrapper = setup();
  });

  afterEach(() => {
    // Cleaning up dispatch mock
    dispatch.mockClear();
    // Cleaning up `useReducer`
    React.useReducer = reactUseReducer;
  });

  it('description-input `onChange` calls dispatch', () => {
    const descriptionInput = findByTestAttr(wrapper, 'description-input');
    const mockEvent = { target: { value : apolloMocks[0].request.variables.description }, preventDefault() {} };
    descriptionInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('description-input `onChange` updates state', () => {
    const descriptionInput = findByTestAttr(wrapper, 'description-input');
    const mockEvent = { target: { value : apolloMocks[0].request.variables.description }, preventDefault() {} };
    descriptionInput.simulate('change', mockEvent);
    expect(state.description).toBe(mockEvent.target.value);
  });

  it('url-input `onChange` calls dispatch', () => {
    const urlInput = findByTestAttr(wrapper, 'url-input');
    const mockEvent = { target: { value : apolloMocks[0].request.variables.url }, preventDefault() {} };
    urlInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('url-input `onChange` updates state', () => {
    const urlInput = findByTestAttr(wrapper, 'url-input');
    const mockEvent = { target: { value : apolloMocks[0].request.variables.url }, preventDefault() {} };
    urlInput.simulate('change', mockEvent);
    expect(state.url).toBe(mockEvent.target.value);
  });

  it('submit button `onClick` submission clears state', async () => {
    // Setting up description state
    const descriptionInput = findByTestAttr(wrapper, 'description-input');
    let mockEvent = { target: { value : apolloMocks[0].request.variables.description }, preventDefault() {} };
    descriptionInput.simulate('change', mockEvent);
    // Setting up url state
    const urlInput = findByTestAttr(wrapper, 'url-input');
    mockEvent = { target: { value : apolloMocks[0].request.variables.url }, preventDefault() {} };
    urlInput.simulate('change', mockEvent);
    // Expect state to equal object
    expect(state).toEqual({ description: apolloMocks[0].request.variables.description, url: apolloMocks[0].request.variables.url });
    // Assertion: state is empty after submit
    const submitButton = findByTestAttr(wrapper, 'submit-button');
    await act(async () => {
      // Submitting button to call the Apollo `useMutation` hook.
      await submitButton.simulate('click');
      await wait(0);
      // Updating wrapper.
      await wrapper.setProps();
    });
    expect(state).toEqual({ description: '', url: '' });
  });
});
