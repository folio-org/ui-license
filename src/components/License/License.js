import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { NotesSmartAccordion } from '@folio/stripes/smart-components';

import {
  AccordionSet,
  Button,
  Col,
  ExpandAllButton,
  Icon,
  IconButton,
  Layout,
  Pane,
  PaneMenu,
  Row,
  Spinner,
} from '@folio/stripes/components';
import { AppIcon, IfPermission, TitleManager } from '@folio/stripes/core';

import {
  LicenseAgreements,
  LicenseAmendments,
  LicenseHeader,
  LicenseInfo,
  LicenseInternalContacts,
  LicenseOrganizations,
  CoreDocs,
  SupplementaryDocs,
  Terms,
} from '../viewSections';

class License extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      license: PropTypes.object,
      terms: PropTypes.array,
      users: PropTypes.array,
    }),
    handlers: PropTypes.shape({
      onClose: PropTypes.func.isRequired,
      onToggleTags: PropTypes.func,
    }).isRequired,
    helperApp: PropTypes.node,
    isLoading: PropTypes.bool,
    urls: PropTypes.shape({
      edit: PropTypes.func,
    }).isRequired,
    stripes: PropTypes.object,
  };

  state = {
    sections: {
      licenseInfo: true,
      licenseInternalContacts: false,
      licenseOrganizations: false,
      licenseCoreDocs: false,
      licenseAmendments: false,
      licenseTerms: false,
      licenseSupplement: false,
      licenseAgreements: false,
      licenseNotes: false,
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
      record: data.license,
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

  handleAllSectionsToggle = (sections) => {
    this.setState({ sections });
  }

  getActionMenu = () => {
    const { urls } = this.props;

    if (!urls.edit) return null;

    return (
      <>
        <Button
          buttonStyle="dropdownItem"
          id="clickable-dropdown-edit-license"
          to={urls.edit()}
        >
          <Icon icon="edit">
            <FormattedMessage id="ui-licenses.edit" />
          </Icon>
        </Button>
      </>
    );
  }

  renderLastMenu = () => {
    const {
      data: { license },
      handlers
    } = this.props;

    return (
      <IfPermission perm="ui-licenses.licenses.edit">
        <PaneMenu>
          {handlers.onToggleTags &&
            <FormattedMessage id="ui-licenses.showTags">
              {ariaLabel => (
                <IconButton
                  icon="tag"
                  id="clickable-show-tags"
                  badgeCount={get(license, 'tags.length', 0)}
                  onClick={handlers.onToggleTags}
                  ariaLabel={ariaLabel}
                />
              )}
            </FormattedMessage>
          }
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
    );
  }

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
    const { data, isLoading, handlers, helperApp } = this.props;

    if (isLoading) return this.renderLoadingPane();

    return (
      <>
        <Pane
          actionMenu={this.getActionMenu}
          appIcon={<AppIcon app="licenses" />}
          defaultWidth="45%"
          dismissible
          id="pane-view-license"
          lastMenu={this.renderLastMenu()}
          onClose={handlers.onClose}
          paneTitle={data.license.name}
        >
          <TitleManager record={data.license.name}>
            <LicenseHeader {...this.getSectionProps()} />
            <AccordionSet>
              <LicenseInfo {...this.getSectionProps('licenseInfo')} />
              <Row end="xs">
                <Col xs>
                  <ExpandAllButton
                    accordionStatus={this.state.sections}
                    id="clickable-expand-all"
                    onToggle={this.handleAllSectionsToggle}
                  />
                </Col>
              </Row>
              <LicenseInternalContacts {...this.getSectionProps('licenseInternalContacts')} />
              <LicenseOrganizations {...this.getSectionProps('licenseOrganizations')} />
              <CoreDocs {...this.getSectionProps('licenseCoreDocs')} />
              <Terms {...this.getSectionProps('licenseTerms')} />
              <LicenseAmendments {...this.getSectionProps('licenseAmendments')} />
              <SupplementaryDocs {...this.getSectionProps('licenseSupplement')} />
              <LicenseAgreements {...this.getSectionProps('licenseAgreements')} />
              <NotesSmartAccordion
                {...this.getSectionProps('licenseNotes')}
                domainName="licenses"
                entityName={data.license.name}
                entityType="license"
                entityId={data.license.id}
                pathToNoteCreate="notes/create"
                pathToNoteDetails="notes"
              />
            </AccordionSet>
          </TitleManager>
        </Pane>
        {helperApp}
      </>
    );
  }
}

export default License;
