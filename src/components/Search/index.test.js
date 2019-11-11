// Libraries
import React from 'react';
import { mount } from 'enzyme';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

// Dependencies
import queries from 'graphql/queries';
import { findByTestAttr, Proxy } from 'test/utils';

// Components
import Search, { reducer, initialState } from '.';

const reactUseReducer = React.useReducer;

function setup(mocks = []) {
  const wrapper = mount(
    <Proxy mocks={mocks}>
      <Search />
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
    const searchComponent = findByTestAttr(wrapper, 'component-search');
    expect(searchComponent.exists()).toBe(true);
  });

  it('renders search input', () => {
    const searchInput = findByTestAttr(wrapper, 'search-input');
    expect(searchInput.exists()).toBe(true);
  });
});

describe('search input element correctly updates state w/ dispatch', () => {
  let wrapper;
  let state = { ...initialState };
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn(action => {
      state = reducer(state, action);
    });
    React.useReducer = jest.fn(React.useReducer).mockReturnValue([state, dispatch]);
    wrapper = setup();
  });

  afterEach(() => {
    React.useReducer = reactUseReducer;
    dispatch.mockClear();
    jest.clearAllMocks();
    state = { ...initialState };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('search input calls dispatch on change event', () => {
    const searchInput = findByTestAttr(wrapper, 'search-input');
    const mockEvent = { target: { value: '' } };
    searchInput.simulate('change', mockEvent);
    expect(dispatch).toHaveBeenCalled();
  });

  it('correctly sets the input state by calling dispatch', () => {
    const searchInput = findByTestAttr(wrapper, 'search-input');
    const mockEvent = { target: { value: 'Link' } };
    searchInput.simulate('change', mockEvent);
    expect(state.filter).toBe(mockEvent.target.value);
  });
});

describe('search query works is set up correctly', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('correctly filters links', async () => {
    // Setting up the Apollo mock for the MockedProvider, filter & results
    let filterQueryCalled = false;
    const filter = 'GraphQL';
    const links = [
      {
        id: "ck2o7c2luh1ji0b00salddnpd",
        description: "Prisma turns your database into a GraphQL API 😎",
        url: "https://www.prismagraphql.com",
        createdAt: "2019-11-07T04:19:15.377Z",
        votes: [],
        postedBy: null
      },
      {
        id: "ck2o7c40zwv5b0b09zpcr0c2u",
        description: "The best GraphQL client for React",
        url: "https://www.apollographql.com/docs/react/",
        createdAt: "2019-11-07T04:19:17.219Z",
        votes: [],
        postedBy: null
      },
    ];
    const filterMocks = [
      {
        request: {
          query: queries.FEED_SEARCH_QUERY,
          variables: {
            filter,
          }
        },
        result: () => {
          filterQueryCalled = true;
          return {
            data: {
              feed: {
                links,
                count: links.length,
              }
            }
          }
        }
      },
    ];

    // Instantiating component
    const wrapper = setup(filterMocks);

    // Finding search input and mocking an onChange event to setup state
    const searchInput = findByTestAttr(wrapper, 'search-input');
    const mockEvent = { target: { value: filter } };
    await act(async () => {
      await searchInput.simulate('change', mockEvent);
      await wait(0);
    });

    // Finding submit button then clicking it to trigger the Apollo query
    const submitButton = findByTestAttr(wrapper, 'submit-button');
  
    await act(async () => {
      await submitButton.simulate('click');
      // Test the loading state just after the click (visual feedback)
      const searchComponent = findByTestAttr(wrapper, 'component-search');
      expect(searchComponent.text()).toContain('Loading');
      // Wait to update the wrapper instance
      await wait(0);
      await wrapper.update();
    });

    // Assert on the query that should have been called
    expect(filterQueryCalled).toBe(true);

    // Assert that the final amount of links is correct (visual feedback)
    const filteredLinks = findByTestAttr(wrapper, 'link');
    expect(filteredLinks.length).toBe(links.length);
  });
});
