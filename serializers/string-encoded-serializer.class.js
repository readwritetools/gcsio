/* Copyright (c) 2022 Read Write Tools. */
import EncodedSerializer from './encoded-serializer.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.js';

import StringBuilder from './builders/string-builder.class.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class StringEncodedSerializer extends EncodedSerializer {
    constructor(t, e, i, r, n, s) {
        expect(t, 'GcsHoldingArea'), expect(e, 'String'), expect(i, 'Number'), expect(r, 'String'), 
        expect(n, 'Array'), expect(s, 'Map'), super(t, e, i, r, n, s), this.stringBuilder = new StringBuilder, 
        Object.seal(this);
    }
    serialize() {
        return super.serialize(), this.stringBuilder.build();
    }
    writeProlog() {
        switch (this.format) {
          case 'ice':
            return void this.stringBuilder.putline(IceMarker.ICE_PROLOG[1]);

          case 'gfe':
            return void this.stringBuilder.putline(IceMarker.GFE_PROLOG[1]);

          default:
            terminal.logic(`expected 'ice', 'icebin', 'gfe' or 'gfebin' but got ${this.format}`);
        }
    }
    writeCoordinates() {
        if ('gfe' == this.format) return;
        this.buildIndexedCoordinates();
        const t = IceMarker.toString(IceMarker.MERIDIANS), e = this.indexedCoordinates.meridians.length;
        this.stringBuilder.putline(`${t} ${e}`);
        for (let t = 0; t < e; t++) {
            let e = this.indexedCoordinates.meridians[t], i = this.toAccuracy(e);
            this.stringBuilder.putline(i);
        }
        const i = IceMarker.toString(IceMarker.PARALLELS), r = this.indexedCoordinates.parallels.length;
        this.stringBuilder.putline(`${i} ${r}`);
        for (let t = 0; t < r; t++) {
            let e = this.indexedCoordinates.parallels[t], i = this.toAccuracy(e);
            this.stringBuilder.putline(i);
        }
    }
    writeDatasetPreliminaries(t) {
        expect(t, 'String');
        const e = IceMarker.toString(IceMarker.DATASET);
        this.stringBuilder.putline(`${e} ${this.datasetId}`);
        const i = IceMarker.toString(IceMarker.GEOMETRY);
        this.stringBuilder.putline(`${i} ${t}`);
        const r = IceMarker.toString(IceMarker.PROPERTIES), {propertyNames: n, propertyTypes: s} = this.getPropertyNamesAndTypes(this.propertiesToInclude, t), o = n.length;
        this.stringBuilder.putline(`${r} ${o}`), this.stringBuilder.putline(n.join(',')), 
        this.stringBuilder.putline(s.join(','));
    }
    beginFeatures(t) {
        const e = IceMarker.toString(IceMarker.FEATURES);
        this.stringBuilder.putline(`${e} ${t}`);
    }
    endFeatures() {
        const t = IceMarker.toString(IceMarker.END);
        this.stringBuilder.putline(t);
    }
    writePointDataset() {
        var t = this.gcsFeaturePoints.length;
        if (0 != t) {
            this.writeDatasetPreliminaries('Point'), this.beginFeatures(t);
            for (let t of this.gcsFeaturePoints) {
                if ('ice' == this.format) {
                    var e = this.indexedCoordinates.getIceX(t.discretePoint.longitude), i = this.indexedCoordinates.getIceY(t.discretePoint.latitude);
                    this.propertyToString('xCoord', e.toString()), this.propertyToString('yCoord', i.toString());
                } else 'gfe' == this.format && (this.propertyToString('lngCoord', this.toAccuracy(t.discretePoint.longitude)), 
                this.propertyToString('latCoord', this.toAccuracy(t.discretePoint.latitude)));
                for (let e in t.kvPairs) this.isPropertyWanted(e) && this.propertyToString(e, t.kvPairs[e]);
            }
            this.endFeatures();
        }
    }
    writeLineDataset() {
        var t = this.gcsFeatureLines.length;
        if (0 != t) {
            this.writeDatasetPreliminaries('Line'), this.beginFeatures(t);
            for (let t of this.gcsFeatureLines) {
                var e = [];
                for (let i = 0; i < t.lineSegment.length; i++) this.buildLongitudes(e, t.lineSegment[i]);
                'ice' == this.format ? this.propertyToString('xSegment', e) : 'gfe' == this.format && this.propertyToString('lngSegment', e), 
                e = [];
                for (let i = 0; i < t.lineSegment.length; i++) this.buildLatitudes(e, t.lineSegment[i]);
                'ice' == this.format ? this.propertyToString('ySegment', e) : 'gfe' == this.format && this.propertyToString('latSegment', e);
                for (let e in t.kvPairs) this.isPropertyWanted(e) && this.propertyToString(e, t.kvPairs[e]);
            }
            this.endFeatures();
        }
    }
    writePolygonDataset() {
        var t = this.gcsFeaturePolygons.length;
        if (0 != t) {
            this.writeDatasetPreliminaries('Polygon'), this.beginFeatures(t);
            for (let t of this.gcsFeaturePolygons) {
                var e = new Array;
                this.addLongitudeLinearRing(e, t.outerRing);
                for (let i = 0; i < t.innerRings.length; i++) this.addLongitudeLinearRing(e, t.innerRings[i]);
                'ice' == this.format ? this.propertyToString('xRings', e) : 'gfe' == this.format && this.propertyToString('lngRings', e), 
                e = new Array, this.addLatitudeLinearRing(e, t.outerRing);
                for (let i = 0; i < t.innerRings.length; i++) this.addLatitudeLinearRing(e, t.innerRings[i]);
                'ice' == this.format ? this.propertyToString('yRings', e) : 'gfe' == this.format && this.propertyToString('latRings', e);
                for (let e in t.kvPairs) this.isPropertyWanted(e) && this.propertyToString(e, t.kvPairs[e]);
            }
            this.endFeatures();
        }
    }
    addLongitudeLinearRing(t, e) {
        expect(t, 'Array'), expect(e, 'Array');
        var i = new Array;
        for (let t = 0; t < e.length - 1; t++) this.buildLongitudes(i, e[t]);
        t.push(i);
    }
    addLatitudeLinearRing(t, e) {
        expect(t, 'Array'), expect(e, 'Array');
        var i = new Array;
        for (let t = 0; t < e.length - 1; t++) this.buildLatitudes(i, e[t]);
        t.push(i);
    }
    buildLongitudes(t, e) {
        if ('ice' == this.format) {
            let i = this.indexedCoordinates.getIceX(e.longitude).toString();
            t.push(i);
        } else if ('gfe' == this.format) {
            let i = this.toAccuracy(e.longitude);
            t.push(i);
        }
    }
    buildLatitudes(t, e) {
        if ('ice' == this.format) {
            let i = this.indexedCoordinates.getIceY(e.latitude).toString();
            t.push(i);
        } else if ('gfe' == this.format) {
            let i = this.toAccuracy(e.latitude);
            t.push(i);
        }
    }
    toAccuracy(t) {
        return expect(t, 'Number'), t.toFixed(this.accuracy);
    }
    propertyToString(t, e) {
        switch (this.getPropertyType(t)) {
          case 'xCoord':
          case 'yCoord':
          case 'lngCoord':
          case 'latCoord':
            return void this.stringBuilder.putline(e);

          case 'xSegment':
          case 'ySegment':
          case 'lngSegment':
          case 'latSegment':
            return expect(e, 'Array'), void this.stringBuilder.putline(e.join(','));

          case 'xRings':
          case 'yRings':
          case 'lngRings':
          case 'latRings':
            expect(e, 'Array');
            var i = [];
            for (let t = 0; t < e.length; t++) i.push(e[t].join(','));
            return void this.stringBuilder.putline(i.join('|'));

          case 'tinyInt':
          case 'tinyUint':
          case 'shortInt':
          case 'shortUint':
          case 'longInt':
          case 'longUint':
            return void (null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(Math.round(e)));

          case 'tinyInt[]':
          case 'tinyUint[]':
          case 'shortInt[]':
          case 'shortUint[]':
          case 'longInt[]':
          case 'longUint[]':
            return expect(e, 'Array'), void (0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(e.map((t => Math.round(t))).join(',')));

          case 'float':
            return void (null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(e.toFixed(this.accuracy)));

          case 'float[]':
            return expect(e, 'Array'), void (0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(e.map((t => t.toFixed(this.accuracy))).join(',')));

          case 'string':
            return void (null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(e));

          case 'string[]':
            return void (0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(JSON.stringify(e)));

          case 'json':
            return void (null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(JSON.stringify(e)));

          default:
            return terminal.trace(`Ignoring unknown property name ${t} with value ${e}`), void this.stringBuilder.putline('');
        }
    }
}