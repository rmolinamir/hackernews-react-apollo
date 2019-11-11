// Libraries
import React from 'react';
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme';
import wait from 'waait';

// Dependencies
import queries from 'graphql/queries';
import { Proxy, findByTestAttr } from 'test/utils';

// Components
import LinkList from '.';

jest.mock("react-router", () => ({
  useHistory: jest.fn().mockReturnValue({
    push() {},
    location: {
      pathname: '/new',
    },
  }),
  useParams: jest.fn().mockReturnValue({
    page: 1,
  }),
}));

const defaultFeedQueryVariables = {
  first: 10,
  skip: 0,
  orderBy: 'createdAt_DESC',
};

const apolloMocks = [
  {
    request: {
      query: queries.FEED_QUERY,
      variables: defaultFeedQueryVariables,
    },
    result: {
      data: {
        feed: {
          links: [
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
            {
              id: "ck2pocw1bot240b00aopmmgxh",
              description: "Des",
              url: "Ur",
              createdAt: "2019-11-08T05:03:33.167Z",
              votes: [],
              postedBy: null
            },
          ],
          count: 3,
        },
      },
    },
  },
  {
    request: {
      query: queries.NEW_LINKS_SUBSCRIPTION,
    },
    result: {
      data: {
        newLink: {
          id: "ck2qwmhcgsvmi0b00g7p41lp2",
          url: "http://localhost:3000/create",
          description: "Testing",
          createdAt: "2019-11-09T01:42:43.792Z",
          postedBy: null,
          votes: [],
        }
      },
    },
  },
  {
    request: {
      query: queries.NEW_VOTES_SUBSCRIPTION,
    },
    result: {
      data: {
        newVote: {
          id: '1',
          link: {
            id: '1',
            votes: [],
          },
          user: {
            id: 'dk2qwmhcgsvmi0b00g7p41lp2'
          }
        }
      },
    },
  },
];

const apolloErrorMocks = [
  {
    request: {
      query: queries.FEED_QUERY,
      variables: defaultFeedQueryVariables,
    },
    error: new Error('Error'),
  },
  {
    request: {
      query: queries.NEW_LINKS_SUBSCRIPTION,
    },
    result: {
      data: {
        newLink: {
          id: "ck2qwmhcgsvmi0b00g7p41lp2",
          url: "http://localhost:3000/create",
          description: "Testing",
          createdAt: "2019-11-09T01:42:43.792Z",
          postedBy: null,
          votes: [],
        }
      },
    },
  },
  {
    request: {
      query: queries.NEW_VOTES_SUBSCRIPTION,
    },
    result: {
      data: {
        newVote: {
          id: '1',
          link: {
            id: '1',
            votes: [],
          },
          user: {
            id: 'dk2qwmhcgsvmi0b00g7p41lp2'
          }
        }
      },
    },
  },
];

function setup(mocks = apolloMocks) {
  const wrapper = mount(
    <Proxy mocks={mocks}>
      <LinkList />
    </Proxy>
  );
  return wrapper;
}

describe('renders', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders without errors', () => {
    const linkComponent = findByTestAttr(wrapper, 'component-link-list');
    expect(linkComponent.exists()).toBe(true);
  });

  it('renders loading when mounting', () => {
    const loading = findByTestAttr(wrapper, 'loading');
    expect(loading.exists()).toBe(true);
  });

  it('renders right amount of links', async () => {
    await act(async () => {
      await wait(0);
      await wrapper.update();
    });
    const links = findByTestAttr(wrapper, 'link');
    const expectedAmountOfLinks = [
      ...apolloMocks[0].result.data.feed.links,
      apolloMocks[1].result.data.newLink,
    ].length;
    expect(links.length).toBe(expectedAmountOfLinks);
  });
});

describe('error UI', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = setup(apolloErrorMocks);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders the error UI without errors', async () => {
    await act(async () => {
      await wait(0);
      await wrapper.update();
    });
    const error = findByTestAttr(wrapper, 'error');
    expect(error.exists()).toBe(true);
  });
});