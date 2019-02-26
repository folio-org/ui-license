import React from 'react';
import PropTypes from 'prop-types';

import {
  AccordionSet,
  Col,
  ExpandAllButton,
  Row
} from '@folio/stripes/components';

import {
  LicenseFormInfo,
  LicenseFormTerms,
} from './Sections';

class LicenseForm extends React.Component {
  static propTypes = {
    parentMutator: PropTypes.object,
    parentResources: PropTypes.object,
  }

  state = {
    sections: {
      licenseFormInfo: true,
      licenseFormTerms: true,
    }
  }

  getSectionProps() {
    return {
      onToggle: this.handleSectionToggle,
      parentResources: this.props.parentResources,
      parentMutator: this.props.parentMutator,
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

  render() {
    const sectionProps = this.getSectionProps();
    const { sections } = this.state;

    return (
      <AccordionSet>
        <Row end="xs">
          <Col xs>
            <ExpandAllButton
              accordionStatus={sections}
              onToggle={this.handleAllSectionsToggle}
            />
          </Col>
        </Row>
        <LicenseFormInfo id="licenseFormInfo" open={sections.licenseFormInfo} {...sectionProps} />
        <LicenseFormTerms id="licenseFormTerms" open={sections.licenseFormTerms} {...sectionProps} />
      </AccordionSet>
    );
  }
}

export default LicenseForm;
