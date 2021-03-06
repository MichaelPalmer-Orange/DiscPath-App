import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import { FaMinusSquare, FaPlusSquare, FaCircle, FaSquare, FaSquareO } from 'react-icons/lib/fa';

import { discShape, throwerShape, displayOptionsShape } from '../../propTypeShapes/bagShapes';
import { drawPath, drawLie } from '../../utils/calculatorUtils';
import { getColorPoint } from '../../utils/colors';

const lieConfig = {
  D: { color: '#ff7800', outline: '#884000' }, // Distance Driver Colors
  F: { color: '#78ff00', outline: '#408800' }, // Fairway Driver Colors
  M: { color: '#0078ff', outline: '#004088' }, // Mid Colors
  P: { color: '#00ffff', outline: '#008888' }, // Putt and Approach Colors
  S: { color: '#ff0000', outline: '#880000' }, // Selected Similar Disc Colors
};

const mapColorsLight = {
  background: '#ffffff',
  lines: '#000000',
  centerLine: '#ff0000',
  fonts: '#000000',
};

const mapColorsDark = {
  background: '#000000',
  lines: '#aaaaaa',
  centerLine: '#ff0000',
  fonts: '#aaaaaa',
};

let canvas;
let pathBuffer;
let lieBuffer;
let outlineBuffer;

class FlightMap extends Component {
  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  resetBuffers() {
    // THIS IS WHAT DRAWS THE CANVAS AND THE GRID
    const { zoom, darkTheme } = this.props;

    canvas = this.canvasRef;
    const setWidth = canvas.width / zoom;
    const setHeight = canvas.height / zoom;

    const colors = darkTheme ? mapColorsDark : mapColorsLight;

    pathBuffer = document.createElement('canvas');
    pathBuffer.width = canvas.width;
    pathBuffer.height = canvas.height;

    lieBuffer = document.createElement('canvas');
    lieBuffer.width = canvas.width;
    lieBuffer.height = canvas.height;

    outlineBuffer = document.createElement('canvas');
    outlineBuffer.width = canvas.width;
    outlineBuffer.height = canvas.height;
    const context = canvas.getContext('2d');
    context.fillStyle = colors.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1.0;
    context.font = '9px helvetica';
    context.fillStyle = colors.fonts;

    let i;
    let j;
    // Draw Vertical Lines
    context.strokeStyle = colors.centerLine;
    context.beginPath();
    context.moveTo((175 * zoom), canvas.height);
    context.lineTo((175 * zoom), 0);
    context.stroke();
    context.textAlign = 'bottom';
    context.fillText(`${0}%`, (canvas.width - (175 * zoom)) + 8, canvas.height - 3);
    // Label Vertical Lines
    context.strokeStyle = colors.lines;
    for (i = 50; i < (175 * zoom); i += 50) {
      const adjustIA = (175 * zoom) + (i * zoom);
      const adjustIB = (175 * zoom) - (i * zoom);
      // Values "Above" 0
      context.beginPath();
      context.moveTo(adjustIA, canvas.height);
      context.lineTo(adjustIA, 0);
      context.stroke();
      if (i < 150) {
        context.textAlign = 'bottom';
        context.fillText(`-${i}%`, adjustIA + 10, canvas.height - 3);
      }
      // Values "Below" 0
      context.beginPath();
      context.moveTo(adjustIB, canvas.height);
      context.lineTo(adjustIB, 0);
      context.stroke();
      if (i < 200) {
        context.textAlign = 'bottom';
        context.fillText(`${i}%`, adjustIB + 10, canvas.height - 3);
      }
    }
    // Draw and Label Horizontal lines
    context.strokeStyle = colors.lines;
    for (j = 0; j <= canvas.height; j += 50) {
      const adjustJ = j * zoom;
      context.beginPath();
      context.moveTo(canvas.height, adjustJ);
      context.lineTo(0, adjustJ);
      context.stroke();
      context.textAlign = 'left';
      context.fillText(`${j}'`, 5, (canvas.height - adjustJ) - 3);
      context.textAlign = 'right';
      context.fillText(`${Math.floor((j) / 3.33)}m`, canvas.width - 5, (canvas.height - adjustJ) - 3);
    }
    const pathContext = pathBuffer.getContext('2d');
    const lieContext = lieBuffer.getContext('2d');
    const outlineContext = outlineBuffer.getContext('2d');
    pathContext.scale(zoom, zoom);
    lieContext.scale(zoom, zoom);
    outlineContext.scale(zoom, zoom);
    pathContext.clearRect(0, 0, setWidth, setHeight);
    lieContext.clearRect(0, 0, setWidth, setHeight);
    outlineContext.clearRect(0, 0, setWidth, setHeight);
  }

  updateCanvas() {
    const {
      thrower,
      discs,
      displayOptions,
      zoom,
      darkTheme,
    } = this.props;
    let pwi;
    let pw;
    let lie;
    let pws;
    let pointColor;
    let weightDiff = 0;
    let powerShift;

    const { power: throwerPower, throwType: throwerThrowType } = thrower;
    const colors = darkTheme ? mapColorsDark : mapColorsLight;

    this.resetBuffers();
    const lieLabels = [];

    const orderedDiscs = _.orderBy(discs, d => d.type);

    // Cycle through Discs
    _.forEach(orderedDiscs, (disc) => {
      if (!disc.enabled) { return; }

      const {
        maxWeight,
        weight,
        power: discPower,
        throwType: discThrowType,
      } = disc;

      pwi = (discPower || throwerPower);

      if (maxWeight && weight) {
        weightDiff = maxWeight - weight;
        powerShift = (weightDiff * 0.005) + 1;

        pwi *= powerShift;
      }

      pw = 0.6 + ((pwi / 48) * 0.6);

      // Draw fan/landing zone if true
      if (displayOptions.fanPower) {
        for (let i = 0; i <= 24; i++) {
          pws = i / 24.0;
          const pwf = 0.6 + (pws * 0.6);
          const delta = Math.abs(pw - pwf);
          const a = Math.min(0.4, Math.max(0.3, Math.cos(delta * 5.5)));

          const pointColor = getColorPoint(disc.color, pws, a);
          const drawPathOptions = {
            dist: (disc.range * ((weightDiff * 0.005) + 1)),
            hss: disc.hst,
            lsf: disc.lsf,
            armspeed: pwf,
            wear: disc.wear || 10,
            throwType: discThrowType || throwerThrowType,
            color: pointColor,
            drawPath: (displayOptions.pathsShown === 'all' && i % 2 === 0),
            pathBuffer,
            canvas,
            zoom,
          };
          lie = drawPath(drawPathOptions);
          const drawLieOptions = {
            x: lie[0],
            y: lie[1],
            markLie: (drawPath === 'all' && i % 2 === 0),
            color: pointColor,
            lieColor: lieConfig[disc.type].color,
            lieOutline: lieConfig[disc.type].outline,
            pathBuffer,
            lieBuffer,
            outlineBuffer,
            zoom,
          };
          drawLie(drawLieOptions);
        }
      }

      // draw disc path for selected throw power
      pws = (pwi / 48.0);
      pointColor = getColorPoint(disc.color, pws);
      const drawPathOptions = {
        dist: (disc.range * ((weightDiff * 0.005) + 1)),
        hss: disc.hst,
        lsf: disc.lsf,
        armspeed: pw,
        wear: disc.wear || 10,
        throwType: discThrowType || throwerThrowType,
        color: pointColor,
        drawPath: (displayOptions.pathsShown === 'all' || displayOptions.pathsShown === 'one'),
        pathBuffer,
        canvas,
        zoom,
      };
      lie = drawPath(drawPathOptions);
      const drawLieOptions = {
        x: lie[0],
        y: lie[1],
        markLie: true,
        color: pointColor,
        lieColor: lieConfig[disc.type].color,
        lieOutline: lieConfig[disc.type].outline,
        pathBuffer,
        lieBuffer,
        outlineBuffer,
        zoom,
      };
      drawLie(drawLieOptions);
      let discName;
      if (disc.displayName) {
        if (disc.weight) {
          discName = `${disc.displayName} - ${disc.weight}g`;
        } else {
          discName = disc.displayName;
        }
      } else if (disc.weight) {
        discName = `${disc.company} ${disc.name} - ${disc.weight}g`;
      } else {
        discName = `${disc.company} ${disc.name}`;
      }
      lieLabels.push([lie, discName]);
    });

    const context = canvas.getContext('2d');
    const setHeight = canvas.height / zoom;

    if (displayOptions.lieCircle) {
      context.globalAlpha = 0.35;
      context.globalCompositeOperation = 'source-over';
      context.drawImage(outlineBuffer, 0, 0);
      context.globalAlpha = 0.15;
      context.globalCompositeOperation = 'source-over';
      context.drawImage(lieBuffer, 0, 0);
      context.globalAlpha = 1.0;
      context.globalCompositeOperation = 'source-over';
    }

    context.drawImage(pathBuffer, 0, 0);

    if (displayOptions.lieDistance) {
      _.forEach(lieLabels, (key) => {
        const lie = key[0];
        const dn = key[1];
        const txt = `${setHeight - lie[1]}' ${Math.floor((setHeight - lie[1]) / 3.33)}m`;
        // const txt = `x: ${175 - lie[0]}, y: ${550 - lie[1]}`;
        context.font = '10px helvetica';
        context.textAlign = 'center';
        context.strokeStyle = colors.background;
        context.fillStyle = colors.fonts;
        context.lineWidth = 1;
        const adjustX = lie[0] * zoom;
        const adjustY = lie[1] * zoom;
        context.strokeText(txt, adjustX, adjustY - 6);
        context.fillText(txt, adjustX, adjustY - 6);
        context.font = '9px helvetica';
        context.strokeText(dn, adjustX, adjustY - 18);
        context.fillText(dn, adjustX, adjustY - 18);
      });
    }
  }

  handleEnlargeMap = () => {
    const { functions } = this.props;

    functions.handleMapEnlarge();
  }

  handleResetMap = () => {
    const { functions } = this.props;

    functions.handleMapReset();
  }

  handleShrinkMap = () => {
    const { functions } = this.props;

    functions.handleMapShrink();
  }

  handleSetDarkTheme = () => {
    const { functions } = this.props;

    functions.handleSetTheme(true);
  }

  handleSetLightTheme = () => {
    const { functions } = this.props;

    functions.handleSetTheme(false);
  }

  render() {
    const {
      width,
      height,
      zoom,
      id,
    } = this.props;

    return (
      <div className="canvasContainer" >
        <div className="zoomButtons" >
          <span style={{ color: 'white' }} >Map Size: </span>
          <span title="Shrink Map" >
            <FaMinusSquare onClick={this.handleShrinkMap} className="zoomButton" />
          </span>
          <span title="Reset Map">
            <FaCircle color="white" onClick={this.handleResetMap} className="zoomButton" />
          </span>
          <span title="Enlarge Map">
            <FaPlusSquare color="white" onClick={this.handleEnlargeMap} className="zoomButton" />
          </span>
        </div>
        <div className="themeButtons" >
          <span style={{ color: 'white' }} >Theme: </span>
          <span title="Light Theme" >
            <FaSquare onClick={this.handleSetLightTheme} color="white" className="zoomButton" />
          </span>
          <span title="Dark Theme">
            <FaSquareO color="white" onClick={this.handleSetDarkTheme} className="zoomButton" />
          </span>
        </div>
        <canvas
          ref={el => this.canvasRef = el} /* eslint-disable-line no-return-assign */
          id={`${id}splineCanvas`}
          className="splineCanvas"
          width={width * zoom}
          height={height * zoom}
        />
      </div>);
  }
}

FlightMap.propTypes = {
  id: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  discs: PropTypes.arrayOf(discShape),
  thrower: PropTypes.shape(throwerShape),
  displayOptions: PropTypes.shape(displayOptionsShape),
  zoom: PropTypes.number,
  darkTheme: PropTypes.bool,
  functions: PropTypes.shape({
    handleMapEnlarge: PropTypes.func,
    handleMapShrink: PropTypes.func,
    handleMapReset: PropTypes.func,
    handleSetTheme: PropTypes.func,
  }),
};

FlightMap.defaultProps = {
  width: 350,
  height: 550,
  zoom: 2,
};

export default FlightMap;
