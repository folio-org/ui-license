import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  AccordionSet,
  Button,
  Icon,
  Layout,
  Pane,
  PaneMenu,
} from '@folio/stripes/components';
import { AppIcon, IfPermission, TitleManager } from '@folio/stripes/core';
import { Spinner } from '@folio/stripes-erm-components';

import {
  LicenseAgreements,
  LicenseAmendments,
  LicenseCoreDocs,
  LicenseHeader,
  LicenseInfo,
  LicenseSupplement,
  LicenseTerms,
} from './sections';

class License extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      license: PropTypes.object,
      terms: PropTypes.array,
      users: PropTypes.array,
    }),
    handlers: PropTypes.shape({
      onClose: PropTypes.func.isRequired,
    }).isRequired,
    urls: PropTypes.shape({
      edit: PropTypes.func,
    }).isRequired,
    stripes: PropTypes.object,
  };

  state = {
    sections: {
      licenseInfo: true,
      licenseCoreDocs: false,
      licenseAmendments: false,
      licenseTerms: false,
      licenseSupplement: false,
      licenseAgreements: false,
    }
  }

  getSectionProps = (id) => {
    const { data, handlers, urls } = this.props;

    return {
      id,
      handlers,
      urls,
      license: data.license,
      onToggle: this.handleSectionToggle,
      open: this.state.sections[id],
      terms: data.terms,
      users: data.users,
    };
  }

  handleSectionToggle = ({ id }) => {
    this.setState((prevState) => ({
      sections: {
        ...prevState.sections,
        [id]: !prevState.sections[id],
      }
    }));
  }

  getActionMenu = () => {
    const { urls } = this.props;

    if (!urls.edit) return null;

    return (
      <React.Fragment>
        <Button
          buttonStyle="dropdownItem"
          id="clickable-dropdown-edit-license"
          to={urls.edit()}
        >
          <Icon icon="edit">
            <FormattedMessage id="ui-licenses.editLicense" />
          </Icon>
        </Button>
      </React.Fragment>
    );
  }

  renderEditLicensePaneMenu = () => (
    <IfPermission perm="ui-licenses.licenses.edit">
      <PaneMenu>
        <FormattedMessage id="ui-licenses.editLicense">
          {ariaLabel => (
            <Button
              aria-label={ariaLabel}
              buttonStyle="primary"
              id="clickable-edit-license"
              marginBottom0
              to={this.props.urls.edit()}
            >
              <FormattedMessage id="stripes-components.button.edit" />
            </Button>
          )}
        </FormattedMessage>
      </PaneMenu>
    </IfPermission>
  )

  renderLoadingPane = () => {
    return (
      <Pane
        defaultWidth="45%"
        dismissible
        id="pane-view-license"
        onClose={this.props.handlers.onClose}
        paneTitle={<FormattedMessage id="ui-licenses.loading" />}
      >
        <Layout className="marginTop1">
          <Spinner />
        </Layout>
      </Pane>
    );
  }

  render() {
    const { data, isLoading, handlers } = this.props;

    if (isLoading) return this.renderLoadingPane();

    return (
      <Pane
        actionMenu={this.getActionMenu}
        appIcon={<AppIcon app="licenses" />}
        defaultWidth="45%"
        dismissible
        id="pane-view-license"
        lastMenu={this.renderEditLicensePaneMenu()}
        onClose={handlers.onClose}
        paneTitle={data.license.name}
      >
        <TitleManager record={data.license.name}>
          <LicenseHeader {...this.getSectionProps()} />
          <AccordionSet>
            <LicenseInfo {...this.getSectionProps('licenseInfo')} />
            <LicenseCoreDocs {...this.getSectionProps('licenseCoreDocs')} />
            <LicenseTerms {...this.getSectionProps('licenseTerms')} />
            <LicenseAmendments {...this.getSectionProps('licenseAmendments')} />
            <LicenseSupplement {...this.getSectionProps('licenseSupplement')} />
            <LicenseAgreements {...this.getSectionProps('licenseAgreements')} />
          </AccordionSet>
        </TitleManager>
      </Pane>
    );
  }
}

export default License;
