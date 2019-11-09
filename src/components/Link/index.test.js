// Libraries
import React from 'react';
import { mount } from 'enzyme';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

// Dependencies
import queries from 'graphql/queries';
import { checkPropTypes, findByTestAttr, mockLocalStorage, Proxy } from 'test/utils';
import { AUTH_TOKEN } from '../../constants';

// Components
import Link from '.';

const defaultProps = {
  link: {
    id: 'ck2o7c2luh1ji0b00salddnpd',
    description: 'Prisma turns your database into a GraphQL API 😎',
    url: 'https://www.prismagraphql.com',
    createdAt: '2019-11-07T04:19:15.377Z',
    votes: [],
    postedBy: {
      name: 'Test user',
    },
  },
  index: 1,
  updateStoreAfterVote: jest.fn(),
}

function setup(initialProps = {}) {
  const wrapper = mount(
    <Proxy mocks={[]}>
      <Link {...defaultProps} />
    </Proxy>
  );
  return wrapper;
}

describe('renders', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(defaultProps);
  });

  it('renders without errors', () => {
    const linkComponent = findByTestAttr(wrapper, 'component-link');
    expect(linkComponent.exists()).toBe(true);
  });

  it('does not renders upvote button w/o an authenticated user', () => {
    const upvoteButton = findByTestAttr(wrapper, 'upvote-button');
    expect(upvoteButton.exists()).toBe(false);
  });

  it('renders without prop type errors', () => {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    checkPropTypes(Link, defaultProps);
  });
});

describe('upvote feature works correctly', () => {
  beforeEach(() => {
    mockLocalStorage();
    defaultProps.updateStoreAfterVote.mockClear();
    window.localStorage.setItem(AUTH_TOKEN, 'token');
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders upvote button with an authenticated user', () => {
    const wrapper = setup(defaultProps);
    const upvoteButton = findByTestAttr(wrapper, 'upvote-button');
    expect(upvoteButton.exists()).toBe(true);
  });

  it('should upvote when clicked', async () => {
    let upvoteMutationCalled = false;
    const mocks = [
      {
        request: {
          query: queries.VOTE_MUTATION,
          variables: {
            linkId: defaultProps.link.id,
          }
        },
        result: () => {
          upvoteMutationCalled = true;
          return {
            data: {
              vote: {
                id: defaultProps.link.id,
                link: {
                  votes: defaultProps.link.votes,
                },
                user: {
                  id: '1',
                },
              }
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <Proxy mocks={mocks}>
        <Link {...defaultProps} />
      </Proxy>
    );

    // Find the upvote button and simulate click
    const upvoteButton = findByTestAttr(wrapper, 'upvote-button');
    
    await act(async () => {
      await upvoteButton.simulate('click');
      await wait(0);
    });

    expect(upvoteMutationCalled).toBe(true);

    expect(defaultProps.updateStoreAfterVote).toHaveBeenCalled();
  });
});

