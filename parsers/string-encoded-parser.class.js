/* Copyright (c) 2022 Read Write Tools. */
import EncodedParser from './encoded-parser.class.js';

import * as SectionMarker from '../util/section-marker.js';

import Coords from '../util/coords.class.js';

import { Arc } from '../tae/topology.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class StringEncodedParser extends EncodedParser {
    constructor(e, t) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), super(e, t), Object.seal(this);
    }
    parse(e) {
        return expect(e, 'String'), this.payload = e, this.payloadLength = this.payload.length, 
        this.payloadOffset = 0, super.parse(e);
    }
    readPayload() {
        var [e, t] = this.readLine().split(' ', 2);
        switch (e) {
          case SectionMarker.MERIDIANS[1]:
            this.numMeridians = Number(t), this.readMeridians();
            break;

          case SectionMarker.PARALLELS[1]:
            this.numParallels = Number(t), this.readParallels();
            break;

          case SectionMarker.COORDINATES[1]:
            this.numCoordinates = Number(t), this.readCoordinates();
            break;

          case SectionMarker.ARCS[1]:
            this.numArcs = Number(t), this.readArcs();
            break;

          case SectionMarker.DATASET[1]:
            this.datasetName = t;
            break;

          case SectionMarker.GEOMETRY[1]:
            this.geometryType = t;
            break;

          case SectionMarker.PROPERTIES[1]:
            this.numProperties = Number(t), this.readProperties();
            break;

          case SectionMarker.FEATURES[1]:
            this.numFeatures = Number(t), this.readFeatures();
            break;

          case SectionMarker.END[1]:
            return !1;

          default:
            return terminal.abnormal(`unexpected marker, got ${e} ${t}`), !1;
        }
        return !0;
    }
    readMeridians() {
        expect(this.numMeridians, 'Number'), aver(this.numMeridians >= 0);
        for (let t = 0; t < this.numMeridians; t++) {
            if ('ice' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a meridians section ${this.url}`), 
            !1;
            var e = Math.fround(Number(this.readLine()));
            this.indexedCoordinates.addLongitude(e);
        }
        return aver(this.numMeridians == this.indexedCoordinates.meridians.length), !0;
    }
    readParallels() {
        expect(this.numParallels, 'Number'), aver(this.numParallels >= 0);
        for (let t = 0; t < this.numParallels; t++) {
            if ('ice' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a parallels section ${this.url}`), 
            !1;
            var e = Math.fround(Number(this.readLine()));
            this.indexedCoordinates.addLatitude(e);
        }
        return aver(this.numParallels == this.indexedCoordinates.parallels.length), !0;
    }
    readCoordinates() {
        if (expect(this.numCoordinates, 'Number'), aver(this.numCoordinates >= 0), 'tae' != this.format) return terminal.logic(`Only Topological Arc Encoding(TAE) expects a coordinates section ${this.url}`), 
        !1;
        for (let a = 0; a < this.numCoordinates; a++) {
            var e = this.readLine(), [t, r] = e.split(','), s = new Coords(Number(t), Number(r));
            this.topology.taeCoords.addVertex(s);
        }
        return aver(this.numCoordinates == this.topology.taeCoords.length - 1), !0;
    }
    readArcs() {
        if (expect(this.numArcs, 'Number'), aver(this.numArcs >= 0), 'tae' != this.format) return terminal.logic(`Only Topological Arc Encoding(TAE) expects an arc section ${this.url}`), 
        !1;
        for (let r = 0; r < this.numArcs; r++) {
            var e = this.readLine().split(','), t = new Arc;
            for (let r = 0; r < e.length; r++) t.push(Number(e[r]));
            this.topology.taeArcs.push(t);
        }
        return aver(this.numArcs == this.topology.taeArcs.length - 1), !0;
    }
    readProperties() {
        return expect(this.numProperties, 'Number'), aver(this.numProperties >= 0), this.propertyNames = this.readLine().split(','), 
        this.propertyTypes = this.readLine().split(','), aver(this.numProperties == this.propertyNames.length), 
        aver(this.numProperties == this.propertyTypes.length), !0;
    }
    readFeatureProperties(e, t, r, s, a) {
        expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), expect(t, 'String'), 
        expect(r, 'String'), expect(s, 'Array'), expect(a, 'Array');
        var i = this.readLine();
        switch (t) {
          case 'xCoord':
            let f = Number(i);
            return s.push(this.indexedCoordinates.getLongitude(f)), !0;

          case 'yCoord':
            let y = Number(i);
            return a.push(this.indexedCoordinates.getLatitude(y)), !0;

          case 'xSegment':
            var n = i.split(',');
            for (let e = 0; e < n.length; e++) s.push(this.indexedCoordinates.getLongitude(n[e]));
            return !0;

          case 'ySegment':
            n = i.split(',');
            for (let e = 0; e < n.length; e++) a.push(this.indexedCoordinates.getLatitude(n[e]));
            return !0;

          case 'xRings':
            var o = i.split('|');
            for (let e = 0; e < o.length; e++) {
                let t = new Array;
                n = o[e].split(',');
                for (let e = 0; e < n.length; e++) t.push(this.indexedCoordinates.getLongitude(n[e]));
                s.push(t);
            }
            return !0;

          case 'yRings':
            o = i.split('|');
            for (let e = 0; e < o.length; e++) {
                let t = new Array;
                n = o[e].split(',');
                for (let e = 0; e < n.length; e++) t.push(this.indexedCoordinates.getLatitude(n[e]));
                a.push(t);
            }
            return !0;

          case 'lngCoord':
            return i = Math.fround(Number(i)), s.push(i), !0;

          case 'latCoord':
            return i = Math.fround(Number(i)), a.push(i), !0;

          case 'lngSegment':
            n = i.split(',');
            for (let e = 0; e < n.length; e++) s.push(Math.fround(Number(n[e])));
            return !0;

          case 'latSegment':
            n = i.split(',');
            for (let e = 0; e < n.length; e++) a.push(Math.fround(Number(n[e])));
            return !0;

          case 'lngRings':
            o = i.split('|');
            for (let e = 0; e < o.length; e++) {
                let t = new Array;
                n = o[e].split(',');
                for (let e = 0; e < n.length; e++) t.push(Math.fround(Number(n[e])));
                s.push(t);
            }
            return !0;

          case 'latRings':
            o = i.split('|');
            for (let e = 0; e < o.length; e++) {
                let t = new Array;
                n = o[e].split(',');
                for (let e = 0; e < n.length; e++) t.push(Math.fround(Number(n[e])));
                a.push(t);
            }
            return !0;

          case 'arcRefs':
            o = i.split('|');
            for (let e = 0; e < o.length; e++) {
                var l = new Array, u = new Array;
                n = o[e].split(',');
                for (let e = 0; e < n.length; e++) {
                    var h = Number(n[e]), d = Math.abs(h), c = this.topology.taeArcs[d];
                    if (h < 0) var p = c.getReverseIndexes(); else p = c;
                    for (let e = 0; e < p.length - 1; e++) {
                        var m = p[e], g = this.topology.taeCoords[m];
                        null == g && terminal.trace(`coordsIndex ${m} not in this.topology.taeCoords`), 
                        l.push(Math.fround(g.longitude)), u.push(Math.fround(g.latitude));
                    }
                }
                s.push(l), a.push(u);
            }
            return !0;

          default:
            return this.handleProperties(e, t, r, i);
        }
    }
    handleProperties(e, t, r, s) {
        switch (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), 
        expect(t, 'String'), expect(r, 'String'), expect(s, 'String'), r) {
          case 'tinyUint':
          case 'shortUint':
          case 'longUint':
          case 'tinyInt':
          case 'shortInt':
          case 'longInt':
          case 'float':
            return e.kvPairs[t] = '' == s || 'null' == s ? null : Number(s), !0;

          case 'tinyUint[]':
          case 'shortUint[]':
          case 'longUint[]':
          case 'tinyInt[]':
          case 'shortInt[]':
          case 'longInt[]':
          case 'float[]':
            var a = s.split('","');
            return e.kvPairs[t] = a.map((e => null == e || '' == e ? 'null' : Number(e))), !0;

          case 'string':
            return '' == s && (s = null), e.kvPairs[t] = s, !0;

          case 'string[]':
            s.length;
            a = (s = s.substring(2, s.length - 2)).split('","');
            return e.kvPairs[t] = a.map((e => null == e || '' == e ? 'null' : e)), !0;

          case 'json':
            return e.kvPairs[t] = JSON.parse(s), !0;

          default:
            return terminal.trace(`handleProperties encountered unknown propertyType '${r}' ${t} = ${s}`), 
            e.kvPairs[t] = s, !1;
        }
    }
    readLine() {
        for (var e = this.payloadOffset, t = 0, r = ''; '\n' != r; ) if (r = this.payload.charAt(e + t), 
        e + ++t > this.payloadLength) throw new Error('reached end of file before it was expected');
        return this.payloadOffset = e + t, this.payload.substr(e, t - 1);
    }
}