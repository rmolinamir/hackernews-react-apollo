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

const apolloMocks = [
  {
    request: {
      query: queries.FEED_QUERY,
    },
    variables: {
      name: 'LinkList',
    },
    result: {
      data: {
        feed: {
          links: [
            {
              id: 'ck2o7c2luh1ji0b00salddnpd',
              description: 'Prisma turns your database into a GraphQL API 😎',
              url: 'https://www.prismagraphql.com',
              createdAt: '2019-11-07T04:19:15.377Z',
            },
            {
              id: 'ck2o7c40zwv5b0b09zpcr0c2u',
              description: 'The best GraphQL client for React',
              url: 'https://www.apollographql.com/docs/react/',
              createdAt: '2019-11-07T04:19:17.219Z',
            }
          ],
        },
      },
    },
  },
];

function setup(mocks = apolloMocks) {
  const wrapper = mount(
    <Proxy mocks={mocks}>
      <LinkList name="LinkList" />
    </Proxy>
  );
  return wrapper;
}

describe('renders', () => {
  let wrapper;
  beforeEach(async () => {
    await act(async () => {
      wrapper = await setup();
    });
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
    });
    await wrapper.update();
    const links = findByTestAttr(wrapper, 'link');
    expect(links.length).toBe(apolloMocks[0].result.data.feed.links.length);
  });
});

describe('error UI', () => {
  const apolloErrorMock = [
    {
      request: {
        query: queries.FEED_QUERY,
        variables: { name: 'LinkList' },
      },
      error: new Error('Error'),
    },
  ];
  let wrapper;
  beforeEach(async () => {
    await act(async () => {
      wrapper = await setup(apolloErrorMock);
    });
  });

  it('renders the error UI without errors', async () => {
    await act(async () => {
      await wait(0);
    });
    await wrapper.update();
    const error = findByTestAttr(wrapper, 'error');
    expect(error.exists()).toBe(true);
  });
});