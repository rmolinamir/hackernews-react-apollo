// Libraries
import React from 'react';
import { shallow } from 'enzyme';

// Dependencies
import { checkPropTypes, findByTestAttr } from 'test/utils';

// Components
import Link from '.';

const defaultProps = {
  link: {
    description: 'description',
    url: 'http://url.test',
  }
}

function setup(initialProps = {}) {
  const wrapper = shallow(<Link {...initialProps} />);
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

  it('renders without prop type errors', () => {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    checkPropTypes(Link, defaultProps);
  });
})