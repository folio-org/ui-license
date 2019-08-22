import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { Select } from '@folio/stripes/components';
import { IntlConsumer } from '@folio/stripes/core';

export default class PickListValueSettings extends React.Component {
  static manifest = {
    categories: {
      type: 'okapi',
      path: 'licenses/refdata',
      accumulate: true,
    },
  };

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.string,
        values: PropTypes.arrayOf({
          id: PropTypes.string,
          value: PropTypes.string,
          label: PropTypes.string,
        }),
      })),
    }),
    mutator: PropTypes.shape({
      categories: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    })
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);

    this.state = {
      categoryId: null,
    };
  }

  /**
   * Refresh lookup tables when the component mounts. Fetches in the manifest
   * will only run once (in the constructor) but because this object may be
   * unmounted/remounted without being destroyed/recreated, the lookup tables
   * will be stale if they change between unmounting/remounting.
   */
  componentDidMount() {
    this.props.mutator.categories.reset();
    this.props.mutator.categories.GET();
  }

  onChangeCategory = (e) => {
    this.setState({ categoryId: e.target.value });
  }

  renderCategories(intl) {
    return [
      { value: 'empty', label: intl.formatMessage({ id: 'ui-licenses.settings.pickListSelect' }) },
      ...get(this.props, 'resources.categories.records', []).map(c => ({ value: c.id, label: c.desc })),
    ];
  }

  renderRowFilter(intl) {
    return (
      <Select
        dataOptions={this.renderCategories(intl)}
        id="categorySelect"
        label={<FormattedMessage id="ui-licenses.settings.pickList" />}
        name="categorySelect"
        onChange={this.onChangeCategory}
      />
    );
  }

  render() {
    return (
      <IntlConsumer>
        {intl => (
          <this.connectedControlledVocab
            {...this.props}
            actuatorType="refdata"
            baseUrl={`licenses/refdata/${this.state.categoryId}`}
            columnMapping={{
              label: intl.formatMessage({ id: 'ui-licenses.settings.value' }),
              actions: intl.formatMessage({ id: 'ui-licenses.settings.actions' }),
            }}
        // We have to unset the dataKey to prevent the props.resources in
        // <ControlledVocab> from being overwritten by the props.resources here.
            dataKey={undefined}
            hiddenFields={['lastUpdated', 'numberOfObjects']}
            id="pick-list-values"
            label={<FormattedMessage id="ui-licenses.settings.pickListValues" />}
            labelSingular={intl.formatMessage({ id: 'ui-licenses.settings.value' })}
            listSuppressor={() => !this.state.categoryId}
            nameKey="label"
            objectLabel={<FormattedMessage id="ui-licenses.settings.values" />}
            records="values"
            rowFilter={this.renderRowFilter(intl)}
            sortby="label"
            stripes={this.props.stripes}
            visibleFields={['label']}
          />
        )}
      </IntlConsumer>
    );
  }
}
