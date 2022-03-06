/* Copyright (c) 2022 Read Write Tools. */
import GcsPointFeature from '../gcs/gcs-point-feature.class.js';

import GcsLineFeature from '../gcs/gcs-line-feature.class.js';

import { GcsPolygonFeature } from '../gcs/gcs-polygon-feature.class.js';

import { PolygonRing } from '../gcs/gcs-polygon-feature.class.js';

import { PolygonCutouts } from '../gcs/gcs-polygon-feature.class.js';

import Coords from '../util/coords.class.js';

import * as SectionMarker from '../util/section-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class EncodedParser {
    constructor(e, t) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), this.gcsHoldingArea = e, this.gcsFeaturePoints = e.gcsFeaturePoints, 
        this.gcsFeatureLines = e.gcsFeatureLines, this.gcsFeaturePolygons = e.gcsFeaturePolygons, 
        this.indexedCoordinates = e.indexedCoordinates, this.topology = e.topology, this.format = t, 
        this.datasetName = '', this.geometryType = '', this.propertyNames = [], this.propertyTypes = [], 
        this.numMeridians = 0, this.numParallels = 0, this.numCoordinates = 0, this.numEdges = 0, 
        this.numArcs = 0, this.arcRefLenBits = 0, this.arcIndexLenBits = 0, this.coordsIndexLenBits = 0, 
        this.numProperties = 0, this.numFeatures = 0, this.payload = null, this.payloadLength = 0, 
        this.payloadOffset = 0;
    }
    parse(e) {
        expect(e, [ 'String', 'ArrayBuffer' ]);
        for (var t = this.readProlog(); 1 == t; ) t = this.readPayload();
        this.gcsHoldingArea.resetIndexedCoordinates(), this.gcsHoldingArea.resetTopology();
        var r = this.payloadLength - this.payloadOffset;
        return 0 == r || (terminal.abnormal(`Premature end of parsing, ${r} bytes at end of file were not parsed`), 
        !1);
    }
    readProlog(e) {
        var t = this.payloadOffset, r = t, s = '';
        switch (this.format) {
          case 'gfe':
            return expect(this.payload, 'String'), r = t + SectionMarker.GFE_PROLOG[1].length, 
            s = this.payload.substring(t, r), this.payloadOffset = r + 1, this.prologSanityCheck(s, SectionMarker.GFE_PROLOG[1]);

          case 'gfebin':
            return expect(this.payload, 'DataView'), r = t + SectionMarker.GFE_PROLOG[0].length, 
            s = (new TextDecoder).decode(this.payload.buffer.slice(t, r)), this.payloadOffset = r, 
            this.prologSanityCheck(s, SectionMarker.GFE_PROLOG[0]);

          case 'ice':
            return expect(this.payload, 'String'), r = t + SectionMarker.ICE_PROLOG[1].length, 
            s = this.payload.substring(t, r), this.payloadOffset = r + 1, this.prologSanityCheck(s, SectionMarker.ICE_PROLOG[1]);

          case 'icebin':
            return expect(this.payload, 'DataView'), r = t + SectionMarker.ICE_PROLOG[0].length, 
            s = (new TextDecoder).decode(this.payload.buffer.slice(t, r)), this.payloadOffset = r, 
            this.prologSanityCheck(s, SectionMarker.ICE_PROLOG[0]);

          case 'tae':
            return expect(this.payload, 'String'), r = t + SectionMarker.TAE_PROLOG[1].length, 
            s = this.payload.substring(t, r), this.payloadOffset = r + 1, s == SectionMarker.TAE_PROLOG[2] ? (terminal.trace(`This file was created with ${SectionMarker.TAE_PROLOG[2]}`), 
            !1) : this.prologSanityCheck(s, SectionMarker.TAE_PROLOG[1]);

          case 'taebin':
            return expect(this.payload, 'DataView'), r = t + SectionMarker.TAE_PROLOG[0].length, 
            s = (new TextDecoder).decode(this.payload.buffer.slice(t, r)), this.payloadOffset = r, 
            this.prologSanityCheck(s, SectionMarker.TAE_PROLOG[0]);

          default:
            terminal.logic(`expected 'gfe', 'gfebin', 'ice', 'icebin', 'tae' or 'taebin' but got ${this.format}`);
        }
    }
    prologSanityCheck(e, t) {
        return t == e || (terminal.abnormal(`Expected ${t} but found ${e} while reading package prolog`), 
        !1);
    }
    readFeatures() {
        expect(this.numFeatures, 'Number'), aver(this.numFeatures >= 0);
        for (let a = 0; a < this.numFeatures; a++) {
            var e = this.createFeature(), t = new Array, r = new Array;
            for (let a = 0; a < this.numProperties; a++) {
                var s = this.propertyNames[a], o = this.propertyTypes[a];
                try {
                    if (0 == this.readFeatureProperties(e, s, o, t, r)) return !1;
                } catch (e) {
                    return terminal.caught(e), !1;
                }
            }
            if (aver(t.length == r.length), 'Point' == this.geometryType) e.discretePoint = new Coords(t[0], r[0]); else if ('Line' == this.geometryType) {
                aver(t.length == r.length);
                let s = t.length;
                for (let o = 0; o < s; o++) e.lineSegment.push(new Coords(t[o], r[o]));
            } else if ('Polygon' == this.geometryType) {
                aver(t.length == r.length);
                let s = t.length;
                for (let o = 0; o < s; o++) {
                    aver(t[o].length == r[o].length);
                    let s = t[o].length;
                    if (0 == o) for (let o = 0; o < s; o++) e.outerRing.push(new Coords(t[0][o], r[0][o])); else {
                        let a = new PolygonRing;
                        for (let e = 0; e < s; e++) a.push(new Coords(t[o][e], r[o][e]));
                        e.innerRings.push(a);
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
}