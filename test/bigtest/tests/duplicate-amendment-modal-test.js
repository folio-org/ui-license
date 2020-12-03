import React from 'react';
import { beforeEach, describe, it } from '@bigtest/mocha';
import chai from 'chai';
import spies from 'chai-spies';

import { mountWithContext } from '../helpers/mountWithContext';

import DuplicateAmendmentModalInteractor from '../interactors/duplicate-amendment-modal';
import DuplicateAmendmentModal from '../../../src/components/DuplicateAmendmentModal';

const modalInteractor = new DuplicateAmendmentModalInteractor();

chai.use(spies);
const { expect, spy } = chai;

const onClone = spy(() => Promise.resolve());
const onClose = spy(() => Promise.resolve());

describe('Duplicate amendment modal tests', () => {
  describe('Rendering duplicate amendment modal', () => {
    beforeEach(async function () {
      await mountWithContext(
        <DuplicateAmendmentModal
          onClone={onClone}
          onClose={onClose}
        />
      );
    });

    it('renders the modal', () => {
      expect(modalInteractor.isDuplicateModalPresent).to.be.true;
    });

    it('renders selectAll at the top', () => {
      expect(modalInteractor.checkBoxList(0).label).to.equal('selectAll');
    });

    it('renders amendmentInfo second', () => {
      expect(modalInteractor.checkBoxList(1).label).to.equal('amendmentInfo');
    });

    it('renders amendmentDateInfo third', () => {
      expect(modalInteractor.checkBoxList(2).label).to.equal('amendmentDateInfo');
    });

    it('renders coreDocs fourth', () => {
      expect(modalInteractor.checkBoxList(3).label).to.equal('coreDocs');
    });

    it('renders terms fifth', () => {
      expect(modalInteractor.checkBoxList(4).label).to.equal('terms');
    });

    it('renders supplementaryDocs sixth', () => {
      expect(modalInteractor.checkBoxList(5).label).to.equal('supplementaryDocs');
    });

    describe('Selecting some fields to duplicate', () => {
      describe('Selecting all', () => {
        beforeEach(async function () {
          await modalInteractor.checkBoxList(0).click();
          await modalInteractor.clickSaveAndClose();
        });

        it('sends correct duplication params', () => {
          expect(onClone).to.have.been.called.with({
            amendmentDateInfo: true,
            amendmentInfo: true,
            coreDocs: true,
            supplementaryDocs: true,
            terms: true
          });
        });
      });

      describe('Selecting some options', () => {
        beforeEach(async function () {
          await modalInteractor.checkBoxList(2).click();
          await modalInteractor.checkBoxList(5).click();
          await modalInteractor.clickSaveAndClose();
        });

        it('sends correct duplication params', () => {
          const expectedPayload = {};
          expectedPayload[modalInteractor.checkBoxList(2).label] = true;
          expectedPayload[modalInteractor.checkBoxList(5).label] = true;

          expect(onClone).to.have.been.called.with(expectedPayload);
        });
      });

      describe('Selecting some other options', () => {
        beforeEach(async function () {
          await modalInteractor.checkBoxList(1).click();
          await modalInteractor.checkBoxList(3).click();
          await modalInteractor.checkBoxList(4).click();
          await modalInteractor.clickSaveAndClose();
        });

        it('sends correct duplication params', () => {
          const expectedPayload = {};
          expectedPayload[modalInteractor.checkBoxList(1).label] = true;
          expectedPayload[modalInteractor.checkBoxList(3).label] = true;
          expectedPayload[modalInteractor.checkBoxList(4).label] = true;

          expect(onClone).to.have.been.called.with(expectedPayload);
        });
      });
    });
  });
});