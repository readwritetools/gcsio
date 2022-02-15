/* Copyright (c) 2022 Read Write Tools. */
import GcsPointFeature from '../gcs/gcs-point-feature.class.js';

import GcsLineFeature from '../gcs/gcs-line-feature.class.js';

import GcsPolygonFeature from '../gcs/gcs-polygon-feature.class.js';

import Coords from '../gcs/coords.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class EncodedParser {
    constructor(e, t) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), this.gcsHoldingArea = e, this.gcsFeaturePoints = e.gcsFeaturePoints, 
        this.gcsFeatureLines = e.gcsFeatureLines, this.gcsFeaturePolygons = e.gcsFeaturePolygons, 
        this.indexedCoordinates = e.indexedCoordinates, this.format = t, this.datasetName = '', 
        this.geometryType = '', this.propertyNames = [], this.propertyTypes = [], this.numMeridians = 0, 
        this.numParallels = 0, this.numProperties = 0, this.numFeatures = 0, this.payload = null, 
        this.payloadLength = 0, this.payloadOffset = 0;
    }
    parse(e) {
        expect(e, [ 'String', 'ArrayBuffer' ]);
        for (var t = this.readProlog(); 1 == t; ) t = this.readPayload();
        this.gcsHoldingArea.resetIndexedCoordinates();
        var r = this.payloadLength - this.payloadOffset;
        return 0 == r || (terminal.trace(`Premature end of parsing, ${r} bytes at end of file were not parsed`), 
        !1);
    }
    readProlog(e) {
        var t = this.payloadOffset, r = t, s = '';
        switch (this.format) {
          case 'ice':
            return expect(this.payload, 'String'), r = t + IceMarker.ICE_PROLOG[1].length, s = this.payload.substring(t, r), 
            this.payloadOffset = r + 1, s == IceMarker.ICE_PROLOG[1];

          case 'icebin':
            return expect(this.payload, 'DataView'), r = t + IceMarker.ICE_PROLOG[0].length, 
            s = (new TextDecoder).decode(this.payload.buffer.slice(t, r)), this.payloadOffset = r, 
            s == IceMarker.ICE_PROLOG[0];

          case 'gfe':
            return expect(this.payload, 'String'), r = t + IceMarker.GFE_PROLOG[1].length, s = this.payload.substring(t, r), 
            this.payloadOffset = r + 1, s == IceMarker.GFE_PROLOG[1];

          case 'gfebin':
            return expect(this.payload, 'DataView'), r = t + IceMarker.GFE_PROLOG[0].length, 
            s = (new TextDecoder).decode(this.payload.buffer.slice(t, r)), this.payloadOffset = r, 
            s == IceMarker.GFE_PROLOG[0];

          default:
            terminal.logic(`expected 'ice', 'icebin', 'gfe' or 'gfebin' but got ${this.format}`);
        }
    }
    readFeatures() {
        expect(this.numFeatures, 'Number'), aver(this.numFeatures >= 0);
        for (let i = 0; i < this.numFeatures; i++) {
            var e = this.createFeature(), t = new Array, r = new Array;
            for (let i = 0; i < this.numProperties; i++) {
                var s = this.propertyNames[i], a = this.propertyTypes[i];
                try {
                    if (0 == this.readFeatureProperties(e, s, a, t, r)) return !1;
                } catch (e) {
                    return terminal.caught(e.message), !1;
                }
            }
            if (aver(t.length == r.length), 'Point' == this.geometryType) e.discretePoint = new Coords(t[0], r[0]); else if ('Line' == this.geometryType) {
                aver(t.length == r.length);
                let s = t.length;
                for (let a = 0; a < s; a++) e.lineSegment.push(new Coords(t[a], r[a]));
            } else if ('Polygon' == this.geometryType) {
                aver(t.length == r.length);
                let s = t.length;
                for (let a = 0; a < s; a++) {
                    aver(t[a].length == r[a].length);
                    let s = t[a].length;
                    if (0 == a) for (let a = 0; a < s; a++) e.outerRing.push(new Coords(t[0][a], r[0][a])); else {
                        let i = new Array;
                        for (let e = 0; e < s; e++) i.push(new Coords(t[a][e], r[a][e]));
                        e.innerRings.push(i);
                    }
                }
                e.closeTheRings();
            }
        }
        return !0;
    }
    createFeature() {
        var e = null;
        switch (this.geometryType) {
          case 'Point':
            e = new GcsPointFeature, this.gcsFeaturePoints.push(e);
            break;

          case 'Line':
            e = new GcsLineFeature, this.gcsFeatureLines.push(e);
            break;

          case 'Polygon':
            e = new GcsPolygonFeature, this.gcsFeaturePolygons.push(e);
            break;

          default:
            terminal.logic(`unknown geometryType ${this.geometryType}`);
        }
        return e;
    }
    deIceLongitude() {
        var e = null;
        return e = 2 == this.packedWidth ? this.readUint16() : this.readUint32(), this.indexedCoordinates.getLongitude(e);
    }
    deIceLatitude() {
        var e = null;
        return e = 2 == this.packedWidth ? this.readUint16() : this.readUint32(), this.indexedCoordinates.getLatitude(e);
    }
    get packedWidth() {
        return this.indexedCoordinates.packedWidth;
    }
}