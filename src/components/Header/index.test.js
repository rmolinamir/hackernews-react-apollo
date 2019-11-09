// Libraries
import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

// Dependencies
import { findByTestAttr } from 'test/utils';

// Components
import Header from '.';

/**
 * Factory function that generates a ReactWrapper.
 * @function setup
 * @param {object} initialProps - Initial props.
 * @returns {ReactWrapper}
 */
function setup(initialProps = {}) {
  const wrapper = mount(
    <BrowserRouter>
      <Header {...initialProps} />
    </BrowserRouter>
  );
  return wrapper;
}

describe('renders', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  it('renders without crashing', () => {
    const headerComponent = findByTestAttr(wrapper, 'component-header');
    expect(headerComponent.exists()).toBe(true);
  });
});
