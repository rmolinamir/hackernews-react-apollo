/**
 * `setupTests.js` is a file that will run before every test.
 * This behavior is configured by `create-react-app`.
 */
import { configure } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true,
});
