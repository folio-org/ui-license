import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Accordion } from '@folio/stripes/components';
import { CustomPropertiesList } from '@folio/stripes-erm-components';

export default class Terms extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    record: PropTypes.shape({ customProperties: PropTypes.object }),
    terms: PropTypes.arrayOf(PropTypes.object),
  }

  render() {
    const { id, onToggle, open, record, terms } = this.props;

    const recordType = (id === 'amendmentTerms') ? 'amendment' : 'license';

    return (
      <FormattedMessage id={`ui-licenses.${recordType}`}>
        {type => (
          <Accordion
            id={id}
            label={<FormattedMessage id="ui-licenses.section.terms" />}
            open={open}
            onToggle={onToggle}
          >
            {
              terms?.length ?
                <CustomPropertiesList
                  customProperties={terms}
                  resource={record}
                /> : <FormattedMessage id="ui-licenses.emptyAccordion.terms" values={{ type: type.toLowerCase() }} />
            }
          </Accordion>
        )}
      </FormattedMessage>
    );
  }
}
