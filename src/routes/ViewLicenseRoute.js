import React from 'react';
import PropTypes from 'prop-types';
import { get, flatten, uniqBy } from 'lodash';
import compose from 'compose-function';

import { stripesConnect } from '@folio/stripes/core';
import { withTags } from '@folio/stripes/smart-components';
import { Tags } from '@folio/stripes-erm-components';

import withFileHandlers from './components/withFileHandlers';
import View from '../components/License';

class ViewLicenseRoute extends React.Component {
  static manifest = Object.freeze({
    interfaces: {
      type: 'okapi',
      path: 'organizations-storage/interfaces',
      params: (_q, _p, _r, _l, props) => {
        const orgs = get(props.resources, 'license.records[0].orgs', []);
        const interfaces = flatten(orgs.map(o => get(o, 'org.orgsUuid_object.interfaces', [])));
        const query = [
          ...new Set(interfaces.map(i => `id==${i}`))
        ].join(' or ');

        return query ? { query } : {};
      },
      fetch: props => !!props.stripes.hasInterface('organizations-storage.interfaces', '2.0'),
      records: 'interfaces',
    },
    interfacesCredentials: {
      clientGeneratePk: false,
      throwErrors: false,
      path: 'organizations-storage/interfaces/%{interfaceRecord.id}/credentials',
      type: 'okapi',
      pk: 'FAKE_PK',  // it's done to fool stripes-connect not to add cred id to the path's end.
      permissionsRequired: 'organizations-storage.interfaces.credentials.item.get',
      fetch: props => !!props.stripes.hasInterface('organizations-storage.interfaces', '1.0 2.0'),
    },
    license: {
      type: 'okapi',
      path: 'licenses/licenses/:{id}',
    },
    linkedAgreements: {
      type: 'okapi',
      path: 'licenses/licenses/:{id}/linkedAgreements',
      params: {
        sort: 'owner.startDate;desc'
      },
      limitParam: 'perPage',
      perRequest: 100,
      recordsRequired: '1000',
      throwErrors: false,
    },
    terms: {
      type: 'okapi',
      path: 'licenses/custprops',
      shouldRefresh: () => false,
    },
    users: {
      type: 'okapi',
      path: 'users',
      params: (_q, _p, _r, _l, props) => {
        const query = get(props.resources, 'license.records[0].contacts', [])
          .filter(contact => contact.user)
          .map(contact => `id==${contact.user}`)
          .join(' or ');

        return query ? { query } : {};
      },
      fetch: props => !!props.stripes.hasInterface('users', '15.0'),
      records: 'users',
    },
    interfaceRecord: {},
    query: {},
  });

  static propTypes = {
    handlers: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired
    }).isRequired,
    mutator: PropTypes.shape({
      interfaceRecord: PropTypes.shape({
        replace: PropTypes.func,
      }),
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      interfaces: PropTypes.object,
      linkedAgreements: PropTypes.object,
      license: PropTypes.object,
      query: PropTypes.shape({
        helper: PropTypes.string,
      }),
      terms: PropTypes.object,
      users: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      okapi: PropTypes.object.isRequired,
    }).isRequired,
    tagsEnabled: PropTypes.bool,
  };

  static defaultProps = {
    handlers: {},
  }

  getCompositeLicense = () => {
    const { resources } = this.props;
    const license = get(resources, 'license.records[0]', {
      contacts: [],
      orgs: [],
    });

    const contacts = license.contacts.map(c => ({
      ...c,
      user: this.getRecord(c.user, 'users') || c.user,
    }));

    const interfacesCredentials = uniqBy(get(resources, 'interfacesCredentials.records', []), 'id');

    const orgs = license.orgs.map(o => ({
      ...o,
      interfaces: get(o, 'org.orgsUuid_object.interfaces', [])
        .map(id => ({
          ...this.getRecord(id, 'interfaces') || {},
          credentials: interfacesCredentials.find(cred => cred.interfaceId === id)
        })),
    }));

    return {
      ...license,
      contacts,
      linkedAgreements: get(resources, 'linkedAgreements.records', []),
      orgs,
    };
  }

  getHelperApp = () => {
    const { match, resources } = this.props;
    const helper = resources.query.helper;
    if (!helper) return null;

    let HelperComponent = null;

    if (helper === 'tags') HelperComponent = Tags;

    if (!HelperComponent) return null;

    return (
      <HelperComponent
        link={`licenses/licenses/${match.params.id}`}
        onToggle={() => this.handleToggleHelper(helper)}
      />
    );
  }

  getRecord = (id, resourceType) => {
    return get(this.props.resources, `${resourceType}.records`, [])
      .find(i => i.id === id);
  }

  handleClose = () => {
    this.props.history.push(`/licenses${this.props.location.search}`);
  }

  handleFetchCredentials = (id) => {
    const { mutator } = this.props;
    mutator.interfaceRecord.replace({ id });
  }

  handleToggleHelper = (helper) => {
    const { mutator, resources } = this.props;
    const currentHelper = resources.query.helper;
    const nextHelper = currentHelper !== helper ? helper : null;

    mutator.query.update({ helper: nextHelper });
  }

  handleToggleTags = () => {
    this.handleToggleHelper('tags');
  }

  urls = {
    edit: this.props.stripes.hasPerm('ui-licenses.licenses.edit') && (() => `${this.props.location.pathname}/edit${this.props.location.search}`),
    addAmendment: this.props.stripes.hasPerm('ui-licenses.licenses.edit') && (() => `${this.props.location.pathname}/amendments/create${this.props.location.search}`),
    viewAmendment: amendmentId => `${this.props.location.pathname}/amendments/${amendmentId}${this.props.location.search}`,
  }

  render() {
    const { handlers, resources, tagsEnabled } = this.props;

    return (
      <View
        data={{
          license: this.getCompositeLicense(),
          terms: get(resources, 'terms.records', []),
        }}
        handlers={{
          ...handlers,
          onClose: this.handleClose,
          onFetchCredentials: this.handleFetchCredentials,
          onToggleHelper: this.handleToggleHelper,
          onToggleTags: tagsEnabled ? this.handleToggleTags : undefined,
        }}
        helperApp={this.getHelperApp()}
        isLoading={get(resources, 'license.isPending', true)}
        urls={this.urls}
      />
    );
  }
}

export default compose(
  withFileHandlers,
  stripesConnect,
  withTags,
)(ViewLicenseRoute);
