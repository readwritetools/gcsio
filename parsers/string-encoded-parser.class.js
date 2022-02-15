/* Copyright (c) 2022 Read Write Tools. */
import EncodedParser from './encoded-parser.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class StringEncodedParser extends EncodedParser {
    constructor(e, r) {
        expect(e, 'GcsHoldingArea'), expect(r, 'String'), super(e, r), Object.seal(this);
    }
    parse(e) {
        return expect(e, 'String'), this.payload = e, this.payloadLength = this.payload.length, 
        this.payloadOffset = 0, super.parse(e);
    }
    readPayload() {
        var [e, r] = this.readLine().split(' ', 2);
        switch (e) {
          case IceMarker.MERIDIANS[1]:
            this.numMeridians = Number(r), this.readMeridians();
            break;

          case IceMarker.PARALLELS[1]:
            this.numParallels = Number(r), this.readParallels();
            break;

          case IceMarker.DATASET[1]:
            this.datasetName = r;
            break;

          case IceMarker.GEOMETRY[1]:
            this.geometryType = r;
            break;

          case IceMarker.PROPERTIES[1]:
            this.numProperties = Number(r), this.readProperties();
            break;

          case IceMarker.FEATURES[1]:
            this.numFeatures = Number(r), this.readFeatures();
            break;

          case IceMarker.END[1]:
            return !1;

          default:
            return terminal.abnormal(`unexpected marker, got ${e} ${r}`), !1;
        }
        return !0;
    }
    readMeridians() {
        expect(this.numMeridians, 'Number'), aver(this.numMeridians >= 0);
        for (let r = 0; r < this.numMeridians; r++) {
            if ('ice' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a meridians section ${this.url}`), 
            !1;
            var e = Math.fround(Number(this.readLine()));
            this.indexedCoordinates.registerLongitude(e);
        }
        return aver(this.numMeridians == this.indexedCoordinates.meridians.length), !0;
    }
    readParallels() {
        expect(this.numParallels, 'Number'), aver(this.numParallels >= 0);
        for (let r = 0; r < this.numParallels; r++) {
            if ('ice' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a parallels section ${this.url}`), 
            !1;
            var e = Math.fround(Number(this.readLine()));
            this.indexedCoordinates.registerLatitude(e);
        }
        return aver(this.numParallels == this.indexedCoordinates.parallels.length), !0;
    }
    readProperties() {
        return expect(this.numProperties, 'Number'), aver(this.numProperties >= 0), this.propertyNames = this.readLine().split(','), 
        this.propertyTypes = this.readLine().split(','), aver(this.numProperties == this.propertyNames.length), 
        aver(this.numProperties == this.propertyTypes.length), !0;
    }
    readFeatureProperties(e, r, t, s, a) {
        expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), expect(r, 'String'), 
        expect(t, 'String'), expect(s, 'Array'), expect(a, 'Array');
        var n = this.readLine();
        switch (r) {
          case 'xCoord':
            let o = Number(n);
            return s.push(this.indexedCoordinates.getLongitude(o)), !0;

          case 'yCoord':
            let u = Number(n);
            return a.push(this.indexedCoordinates.getLatitude(u)), !0;

          case 'xSegment':
            var i = n.split(',');
            for (let e = 0; e < i.length; e++) s.push(this.indexedCoordinates.getLongitude(i[e]));
            return !0;

          case 'ySegment':
            i = n.split(',');
            for (let e = 0; e < i.length; e++) a.push(this.indexedCoordinates.getLatitude(i[e]));
            return !0;

          case 'xRings':
            var l = n.split('|');
            for (let e = 0; e < l.length; e++) {
                let r = new Array;
                i = l[e].split(',');
                for (let e = 0; e < i.length; e++) r.push(this.indexedCoordinates.getLongitude(i[e]));
                s.push(r);
            }
            return !0;

          case 'yRings':
            l = n.split('|');
            for (let e = 0; e < l.length; e++) {
                let r = new Array;
                i = l[e].split(',');
                for (let e = 0; e < i.length; e++) r.push(this.indexedCoordinates.getLatitude(i[e]));
                a.push(r);
            }
            return !0;

          case 'lngCoord':
            return n = Math.fround(Number(n)), s.push(n), !0;

          case 'latCoord':
            return n = Math.fround(Number(n)), a.push(n), !0;

          case 'lngSegment':
            i = n.split(',');
            for (let e = 0; e < i.length; e++) s.push(Math.fround(Number(i[e])));
            return !0;

          case 'latSegment':
            i = n.split(',');
            for (let e = 0; e < i.length; e++) a.push(Math.fround(Number(i[e])));
            return !0;

          case 'lngRings':
            l = n.split('|');
            for (let e = 0; e < l.length; e++) {
                let r = new Array;
                i = l[e].split(',');
                for (let e = 0; e < i.length; e++) r.push(Math.fround(Number(i[e])));
                s.push(r);
            }
            return !0;

          case 'latRings':
            l = n.split('|');
            for (let e = 0; e < l.length; e++) {
                let r = new Array;
                i = l[e].split(',');
                for (let e = 0; e < i.length; e++) r.push(Math.fround(Number(i[e])));
                a.push(r);
            }
            return !0;

          default:
            return this.handleProperties(e, r, t, n);
        }
    }
    handleProperties(e, r, t, s) {
        switch (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), 
        expect(r, 'String'), expect(t, 'String'), expect(s, 'String'), t) {
          case 'tinyUint':
          case 'shortUint':
          case 'longUint':
          case 'tinyInt':
          case 'shortInt':
          case 'longInt':
          case 'float':
            return e.kvPairs[r] = '' == s ? null : Number(s), !0;

          case 'tinyUint[]':
          case 'shortUint[]':
          case 'longUint[]':
          case 'tinyInt[]':
          case 'shortInt[]':
          case 'longInt[]':
          case 'float[]':
            var a = s.split(',').forEach((e => '' == e ? null : Number(e)));
            return e.kvPairs[r] = [ ...a ], !0;

          case 'string':
            return '' == s && (s = null), e.kvPairs[r] = s, !0;

          case 'string[]':
            s.length;
            a = (s = s.substring(2, s.length - 2)).split('","');
            return e.kvPairs[r] = [ ...a ].forEach((e => 'null' == e ? null : e)), !0;

          case 'json':
            return e.kvPairs[r] = JSON.parse(s), !0;

          default:
            return terminal.trace(`handleProperties encountered unknown propertyType '${t}' ${r} = ${s}`), 
            e.kvPairs[r] = s, !1;
        }
    }
    readLine() {
        for (var e = this.payloadOffset, r = 0, t = ''; '\n' != t; ) if (t = this.payload.charAt(e + r), 
        e + ++r > this.payloadLength) throw new Error('reached end of file before it was expected');
        return this.payloadOffset = e + r, this.payload.substr(e, r - 1);
    }
}