/* Copyright (c) 2022 Read Write Tools. */
import EncodedSerializer from './encoded-serializer.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.js';

import StringBuilder from './builders/string-builder.class.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class StringEncodedSerializer extends EncodedSerializer {
    constructor(e, t, i, r, n, s) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), expect(i, 'Number'), expect(r, 'String'), 
        expect(n, 'Array'), expect(s, 'Map'), super(e, t, i, r, n, s), this.stringBuilder = new StringBuilder, 
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
        const e = IceMarker.toString(IceMarker.MERIDIANS), t = this.indexedCoordinates.meridians.length;
        this.stringBuilder.putline(`${e} ${t}`);
        for (let e = 0; e < t; e++) this.stringBuilder.putline(this.indexedCoordinates.meridians[e]);
        const i = IceMarker.toString(IceMarker.PARALLELS), r = this.indexedCoordinates.parallels.length;
        this.stringBuilder.putline(`${i} ${r}`);
        for (let e = 0; e < r; e++) this.stringBuilder.putline(this.indexedCoordinates.parallels[e]);
    }
    writeDatasetPreliminaries(e) {
        expect(e, 'String');
        const t = IceMarker.toString(IceMarker.DATASET);
        this.stringBuilder.putline(`${t} ${this.datasetId}`);
        const i = IceMarker.toString(IceMarker.GEOMETRY);
        this.stringBuilder.putline(`${i} ${e}`);
        const r = IceMarker.toString(IceMarker.PROPERTIES), {propertyNames: n, propertyTypes: s} = this.getPropertyNamesAndTypes(this.propertiesToInclude, e), o = n.length;
        this.stringBuilder.putline(`${r} ${o}`), this.stringBuilder.putline(n.join(',')), 
        this.stringBuilder.putline(s.join(','));
    }
    beginFeatures(e) {
        const t = IceMarker.toString(IceMarker.FEATURES);
        this.stringBuilder.putline(`${t} ${e}`);
    }
    endFeatures() {
        const e = IceMarker.toString(IceMarker.END);
        this.stringBuilder.putline(e);
    }
    writePointDataset() {
        var e = this.gcsFeaturePoints.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Point'), this.beginFeatures(e);
            for (let e of this.gcsFeaturePoints) {
                if ('ice' == this.format) {
                    var t = this.indexedCoordinates.getIceX(e.discretePoint.longitude), i = this.indexedCoordinates.getIceY(e.discretePoint.latitude);
                    this.propertyToString('xCoord', t), this.propertyToString('yCoord', i);
                } else 'gfe' == this.format && (this.propertyToString('lngCoord', e.discretePoint.longitude), 
                this.propertyToString('latCoord', e.discretePoint.latitude));
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToString(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    writeLineDataset() {
        var e = this.gcsFeatureLines.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Line'), this.beginFeatures(e);
            for (let e of this.gcsFeatureLines) {
                var t = [];
                for (let i = 0; i < e.lineSegment.length; i++) this.buildLongitudes(t, e.lineSegment[i]);
                'ice' == this.format ? this.propertyToString('xSegment', t) : 'gfe' == this.format && this.propertyToString('lngSegment', t), 
                t = [];
                for (let i = 0; i < e.lineSegment.length; i++) this.buildLatitudes(t, e.lineSegment[i]);
                'ice' == this.format ? this.propertyToString('ySegment', t) : 'gfe' == this.format && this.propertyToString('latSegment', t);
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToString(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    writePolygonDataset() {
        var e = this.gcsFeaturePolygons.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Polygon'), this.beginFeatures(e);
            for (let e of this.gcsFeaturePolygons) {
                var t = new Array;
                this.addLongitudeLinearRing(t, e.outerRing);
                for (let i = 0; i < e.innerRings.length; i++) this.addLongitudeLinearRing(t, e.innerRings[i]);
                'ice' == this.format ? this.propertyToString('xRings', t) : 'gfe' == this.format && this.propertyToString('lngRings', t), 
                t = new Array, this.addLatitudeLinearRing(t, e.outerRing);
                for (let i = 0; i < e.innerRings.length; i++) this.addLatitudeLinearRing(t, e.innerRings[i]);
                'ice' == this.format ? this.propertyToString('yRings', t) : 'gfe' == this.format && this.propertyToString('latRings', t);
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToString(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    addLongitudeLinearRing(e, t) {
        expect(e, 'Array'), expect(t, 'Array');
        var i = new Array;
        for (let e = 0; e < t.length - 1; e++) this.buildLongitudes(i, t[e]);
        e.push(i);
    }
    addLatitudeLinearRing(e, t) {
        expect(e, 'Array'), expect(t, 'Array');
        var i = new Array;
        for (let e = 0; e < t.length - 1; e++) this.buildLatitudes(i, t[e]);
        e.push(i);
    }
    buildLongitudes(e, t) {
        'ice' == this.format ? e.push(this.indexedCoordinates.getIceX(t.longitude).toString()) : 'gfe' == this.format && e.push(t.longitude.toString());
    }
    buildLatitudes(e, t) {
        'ice' == this.format ? e.push(this.indexedCoordinates.getIceY(t.latitude).toString()) : 'gfe' == this.format && e.push(t.latitude.toString());
    }
    propertyToString(e, t) {
        switch (this.getPropertyType(e)) {
          case 'xCoord':
          case 'yCoord':
          case 'lngCoord':
          case 'latCoord':
            return void this.stringBuilder.putline(t);

          case 'xSegment':
          case 'ySegment':
          case 'lngSegment':
          case 'latSegment':
            return expect(t, 'Array'), void this.stringBuilder.putline(t.join(','));

          case 'xRings':
          case 'yRings':
          case 'lngRings':
          case 'latRings':
            expect(t, 'Array');
            var i = [];
            for (let e = 0; e < t.length; e++) i.push(t[e].join(','));
            return void this.stringBuilder.putline(i.join('|'));

          case 'tinyInt':
          case 'tinyUint':
          case 'shortInt':
          case 'shortUint':
          case 'longInt':
          case 'longUint':
            return void (null == t ? this.stringBuilder.putline('') : this.stringBuilder.putline(Math.round(t)));

          case 'tinyInt[]':
          case 'tinyUint[]':
          case 'shortInt[]':
          case 'shortUint[]':
          case 'longInt[]':
          case 'longUint[]':
            return expect(t, 'Array'), void (0 == t.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(t.map((e => Math.round(e))).join(',')));

          case 'float':
            return void (null == t ? this.stringBuilder.putline('') : this.stringBuilder.putline(t.toFixed(this.accuracy)));

          case 'float[]':
            return expect(t, 'Array'), void (0 == t.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(t.map((e => e.toFixed(this.accuracy))).join(',')));

          case 'string':
            return void (null == t ? this.stringBuilder.putline('') : this.stringBuilder.putline(t));

          case 'string[]':
            return void (0 == t.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(JSON.stringify(t)));

          case 'json':
            return void (null == t ? this.stringBuilder.putline('') : this.stringBuilder.putline(JSON.stringify(t)));

          default:
            return terminal.trace(`Ignoring unknown property name ${e} with value ${t}`), void this.stringBuilder.putline('');
        }
    }
}