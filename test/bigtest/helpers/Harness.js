import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

import translations from '../../../translations/ui-licenses/en';

// mimics the StripesTranslationPlugin in @folio/stripes-core
function prefixKeys(obj) {
  const res = {};
  for (const key of Object.keys(obj)) {
    res[`ui-licenses.${key}`] = obj[key];
  }
  return res;
}

class Harness extends React.Component {
  render() {
    return (
      <IntlProvider locale="en" key="en" timeZone="UTC" messages={prefixKeys(translations)}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

Harness.propTypes = {
  children: PropTypes.node,
};

export default Harness;
