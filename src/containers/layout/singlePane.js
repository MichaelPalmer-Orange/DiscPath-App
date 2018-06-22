import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';

import FlightMap from '../../components/map/flightMap';
import BagContainer from '../bag';
import Thrower from '../../components/menus/thrower';
import DisplayOptions from '../../components/menus/displayOptions';
import ImportExport from '../../components/menus/importExport';
import { companyShape } from '../../propTypeShapes/companyShapes';
import { throwerShape, displayOptionsShape, bagShape } from '../../propTypeShapes/bagShapes';
import * as CompanyActions from '../../actions/company';
import * as BagActions from '../../actions/bag';
import * as MenuActions from '../../actions/menus';
import { currentCompaniesSelector, currentSelectionSelector } from '../../selector/companiesSelector';
import { throwerSelector, bagSelector, displayOptionsSelector, discTypesSelector } from '../../selector/bagSelector';

class SinglePane extends Component {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(CompanyActions.loadCompanies());
  }
  getDiscById = (discId) => {
    const { companies } = this.props;
    const discData = discId.split('-');

    if (discData.length === 2) {
      const company = _.find(companies, company => company.companyId === discData[0]);
      if (company !== null) {
        const disc = _.find(company.discs, disc => disc.discId === discData[1]);
        return { company, disc };
      }
    }
    return null;
  }

  handleToggleThrowerModal = () => {
    const { dispatch, throwerModal } = this.props;

    if (throwerModal) {
      dispatch(MenuActions.closerThrowerModal());
    } else {
      dispatch(MenuActions.openThrowerModal());
    }
  }

  handleToggleDisplayOptionModal = () => {
    const { dispatch, displayOptionModal } = this.props;

    if (displayOptionModal) {
      dispatch(MenuActions.closeDisplayOptionsModal());
    } else {
      dispatch(MenuActions.openDisplayOptionsModal());
    }
  }

  handleToggleImportExportModal = () => {
    const { dispatch, importExportModal } = this.props;

    if (importExportModal) {
      dispatch(MenuActions.closeImportExportModal());
    } else {
      dispatch(MenuActions.openImportExportModal());
    }
  }

  handleChangeThrowerType = (throwerType) => {
    const { dispatch } = this.props;

    dispatch(BagActions.changeThrowerType(throwerType));
  }

  handleChangeThrowerPower = (throwerPower) => {
    const { dispatch } = this.props;

    dispatch(BagActions.changeThrowerPower(throwerPower));
  }

  handleChangeFanPower = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.changeFanPower());
  }

  handleChangePaths = (paths) => {
    const { dispatch } = this.props;

    dispatch(BagActions.changePaths(paths));
  }

  handleChangeLieDistance = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.changeLieDistance());
  }

  handleChangeLieCircle = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.changeLieCircles());
  }

  handleExportToFile = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.exportBagsToFile());
  }

  handleImportFromFile = (file) => {
    const { dispatch } = this.props;

    dispatch(BagActions.importBagsFromFile(file));
  }

  handleMapEnlarge = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.enlargeMap());
  }

  handleMapShrink = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.shrinkMap());
  }

  handleMapReset = () => {
    const { dispatch } = this.props;

    dispatch(BagActions.resetMap());
  }

  render() {
    const {
      pageTitle,
      pageHeader,
      thrower,
      displayOptions,
      currentBags,
      selectedBagId,
      zoom,
      throwerModal,
      displayOptionModal,
      importExportModal,
    } = this.props;

    const currentBag = _.filter(currentBags, bag => bag.bagId === parseInt(selectedBagId, 10))[0];

    const mapFunctions = {
      handleMapEnlarge: this.handleMapEnlarge,
      handleMapShrink: this.handleMapShrink,
      handleMapReset: this.handleMapReset,
    };

    const content = (
      <DocumentTitle title={pageTitle}>
        <React.Fragment>
          <header className="App-header grid-item-header">
            <h1 className="App-title">{pageHeader}</h1>
            To report problems or offer suggestions&nbsp;
            <a
              href="https://github.com/MichaelPalmer-Orange/DiscPath-App/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="help-request"
            >click here
            </a><br />
            To view documentation and ask questions&nbsp;
            <a
              href="https://discpath.readme.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="help-request"
            >click here
            </a>
          </header>
          <div className="workspace-container grid-container" >
            <div className="grid-item-credits">
              Disc flight information from&nbsp;
              <a
                href="http://www.inboundsdiscgolf.com/content/?page_id=431"
                target="_blank"
                rel="noopener noreferrer"
              >Inbounds Disc Golf InFlight Guide
              </a>
            </div>
            <div className="grid-item-menu" >
              <button onClick={this.handleToggleThrowerModal} >Thrower</button>
              <button onClick={this.handleToggleDisplayOptionModal}>Display Options</button>
              <button onClick={this.handleToggleImportExportModal}>Import/Export</button>
            </div>
            <div className="grid-item1 grid-item">
              <FlightMap
                discs={currentBag.discs}
                thrower={thrower}
                displayOptions={displayOptions}
                zoom={zoom}
                functions={mapFunctions}
              />
            </div>
            <div className="grid-item2 grid-item">
              <BagContainer state />
            </div>
            <Thrower
              thrower={thrower}
              changePower={this.handleChangeThrowerPower}
              changeThrowerType={this.handleChangeThrowerType}
              openModal={throwerModal}
              closeModal={this.handleToggleThrowerModal}
            />
            <DisplayOptions
              options={displayOptions}
              changeFanPower={this.handleChangeFanPower}
              changePaths={this.handleChangePaths}
              changeDistance={this.handleChangeLieDistance}
              changeCircles={this.handleChangeLieCircle}
              openModal={displayOptionModal}
              closeModal={this.handleToggleDisplayOptionModal}
            />
            <ImportExport
              importFunction={this.handleImportFromFile}
              exportFunction={this.handleExportToFile}
              openModal={importExportModal}
              closeModal={this.handleToggleImportExportModal}
            />
          </div>
        </React.Fragment>
      </DocumentTitle>
    );

    return content;
  }
}


SinglePane.propTypes = {
  pageTitle: PropTypes.string,
  pageHeader: PropTypes.string,
  companies: PropTypes.arrayOf(companyShape),
  currentBags: PropTypes.arrayOf(bagShape),
  thrower: PropTypes.shape(throwerShape),
  displayOptions: PropTypes.shape(displayOptionsShape),
  dispatch: PropTypes.func,
  selectedBagId: PropTypes.number,
  zoom: PropTypes.number,
  throwerModal: PropTypes.bool,
  displayOptionModal: PropTypes.bool,
  importExportModal: PropTypes.bool,
};

SinglePane.defaultProps = {
  pageTitle: 'DiscPath',
  pageHeader: 'Experimental Disc Golf Flight Path Visualizer',
  companies: [],
  currentBags: [],
  thrower: null,
  displayOptions: null,
  selectedBagId: 1,
  zoom: 1,
};

const mapStateToProps = state => ({
  companies: currentCompaniesSelector(state),
  currentSelection: currentSelectionSelector(state),
  currentBags: bagSelector(state),
  thrower: throwerSelector(state),
  displayOptions: displayOptionsSelector(state),
  discTypes: discTypesSelector(state),
  selectedBagId: state.bag.selectedBagId,
  dispatch: state.dispatch,
  addBag: state.bag.addBag,
  updateBag: state.bag.updateBag,
  zoom: state.bag.zoom,
  throwerModal: state.menus.throwerModal,
  displayOptionModal: state.menus.displayOptionModal,
  importExportModal: state.menus.importExportModal,
});

export default connect(mapStateToProps)(SinglePane);
