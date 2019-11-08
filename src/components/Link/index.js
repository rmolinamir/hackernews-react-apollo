// Libraries
import React from 'react';
import PropTypes from 'prop-types';

export default function Link(props) {
  const { link: { description, url } } = props;
  return (
    <div data-test="component-link">
      <div>
        {`${description} ${url}`}
      </div>
    </div>
  )
}

Link.propTypes = {
  link: PropTypes.instanceOf(Object).isRequired,
}
