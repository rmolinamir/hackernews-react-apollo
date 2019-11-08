// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import checkProps from 'check-prop-types';

// Components
import { MockedProvider } from '@apollo/react-testing';

/**
 * Factory function that proxies the props to the children, and includes commonly
 * used providers in tests. This allows use to use `wrapper.setProps` and relay
 * the props to the children.
 * @param {ReactNode} children - Valid React children to relay them their props.
 * @param {obj} relayedProps - Relayed props that are sent to the children.
 * @return {ReactNode}
 */
export function Proxy({ children, mocks, ...relayedProps }) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
}

Proxy.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  mocks: PropTypes.instanceOf(Object).isRequired,
};

/**
 * Return ShallowWrapper containing node(s) with the given data-test value.
 * @param {ShallowWrapper} wrapper - Enzyme shallow wrapper to search within
 * @param {string} val - Value of data-test attribute for search.
 * @return {ShallowWrapper}
 */
export function findByTestAttr(wrapper, val) {
  return wrapper.find(`[data-test="${val}"]`);
}

/**
 * Takes some expected props and see wether or not they would throw a warning.
 * The general idea is to give expected props to be good, and make sure they
 * do not throw a warning.
 * @param {React.Component} component - React component with propTypes property.
 * @param {object} conformingProps - Expected props object.
 * @return {void}
 */
export function checkPropTypes(component, conformingProps) {
  const propError = checkProps(
    // Disabling this ESLint warning. These helpers aren't supposed to be used
    // in production anyway.
    // eslint-disable-next-line react/forbid-foreign-prop-types
    component.propTypes,
    conformingProps,
    'prop',
    component.name,
  );
  expect(propError).toBeUndefined();
}

/**
 * `Jest` does not implement window.resizeBy() or window.resizeTo(), and it
 * defines the window innerWidth and innerHeight to be 1024 x 768 by default.
 * It's possible to simulate a window resize by manually setting `window.innerWidth`,
 * `window.innerHeight`, and firing the resize event.
 * @param {number} width - Window width.
 * @param {number} height - Window height.
 */
export function resizeWindow(width, height, shouldFireEvent = true) {
  if (width) {
    Object.defineProperty(
      window,
      'innerWidth',
      { writable: true, configurable: true, value: width }
    );
  }
  if (height) {
    Object.defineProperty(
      window,
      'innerHeight',
      { writable: true, configurable: true, value: height }
    );
  }
  if (width || height || shouldFireEvent) {
    window.dispatchEvent(new Event('resize'));
  }
}

/**
 * Sets the window dimensions back to Jest's default values.
 * @function defaultSize
 */
resizeWindow.defaultSize = function defaultSize() {
  resizeWindow(1024, 768, true);
};

/**
 * Utility function that mocks the `IntersectionObserver` API. Necessary for components that rely
 * on it, otherwise the tests will crash. Recommended to execute inside `beforeEach`.
 * @param {object} intersectionObserverMock - Parameter that is sent to the `Object.defineProperty`
 *      overwrite method. `jest.fn()` mock functions can be passed here if the goal is to not only
 *      mock the intersection observer, but its methods.
 */
export function setupIntersectionObserverMock({
  observe = () => null,
  unobserve = () => null,
} = {}) {
  class IntersectionObserver {
    observe = observe;
    unobserve = unobserve;
  }
  Object.defineProperty(
    window,
    'IntersectionObserver',
    { writable: true, configurable: true, value: IntersectionObserver }
  );
  Object.defineProperty(
    global,
    'IntersectionObserver',
    { writable: true, configurable: true, value: IntersectionObserver }
  );
}
