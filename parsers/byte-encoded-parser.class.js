/* Copyright (c) 2022 Read Write Tools. */
import EncodedParser from './encoded-parser.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class ByteEncodedParser extends EncodedParser {
    constructor(e, t) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), super(e, t), Object.seal(this);
    }
    parse(e) {
        return expect(e, 'ArrayBuffer'), this.payload = new DataView(e), this.payloadLength = this.payload.byteLength, 
        this.payloadOffset = 0, super.parse(e);
    }
    readPayload() {
        var e = this.readMarker();
        switch (e) {
          case IceMarker.MERIDIANS[0]:
            this.numMeridians = this.readUint32(), this.readMeridians();
            break;

          case IceMarker.PARALLELS[0]:
            this.numParallels = this.readUint32(), this.readParallels();
            break;

          case IceMarker.DATASET[0]:
            this.datasetName = this.readLenPrefixedText();
            break;

          case IceMarker.GEOMETRY[0]:
            this.geometryType = this.readLenPrefixedText();
            break;

          case IceMarker.PROPERTIES[0]:
            this.numProperties = this.readUint8(), this.readProperties();
            break;

          case IceMarker.FEATURES[0]:
            this.numFeatures = this.readUint32(), this.readFeatures();
            break;

          case IceMarker.END[0]:
            return !1;

          default:
            return terminal.abnormal(`unexpected marker, got ${e.toString('16').padStart(8, '0')}`), 
            !1;
        }
        return !0;
    }
    readMeridians() {
        expect(this.numMeridians, 'Number'), aver(this.numMeridians >= 0);
        for (let t = 0; t < this.numMeridians; t++) {
            if ('icebin' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a meridians section ${this.url}`), 
            !1;
            var e = Math.fround(this.readFloat32());
            this.indexedCoordinates.registerLongitude(e);
        }
        return aver(this.numMeridians == this.indexedCoordinates.meridians.length), !0;
    }
    readParallels() {
        expect(this.numParallels, 'Number'), aver(this.numParallels >= 0);
        for (let t = 0; t < this.numParallels; t++) {
            if ('icebin' != this.format) return terminal.logic(`Geoplex Feature Encoding (GFE) must not have a parallels section ${this.url}`), 
            !1;
            var e = Math.fround(this.readFloat32());
            this.indexedCoordinates.registerLatitude(e);
        }
        return aver(this.numParallels == this.indexedCoordinates.parallels.length), !0;
    }
    readProperties() {
        expect(this.numProperties, 'Number'), aver(this.numProperties >= 0);
        for (let e = 0; e < this.numProperties; e++) this.propertyNames.push(this.readLenPrefixedText());
        for (let e = 0; e < this.numProperties; e++) this.propertyTypes.push(this.readLenPrefixedText());
        return aver(this.numProperties == this.propertyNames.length), aver(this.numProperties == this.propertyTypes.length), 
        !0;
    }
    readFeatureProperties(e, t, r, a, s) {
        switch (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), 
        expect(t, 'String'), expect(r, 'String'), expect(a, 'Array'), expect(s, 'Array'), 
        t) {
          case 'xCoord':
            return a.push(this.deIceLongitude()), !0;

          case 'yCoord':
            return s.push(this.deIceLatitude()), !0;

          case 'xSegment':
            var i = this.readUint16();
            for (let e = 0; e < i; e++) a.push(this.deIceLongitude());
            return !0;

          case 'ySegment':
            var n = this.readUint16();
            for (let e = 0; e < n; e++) s.push(this.deIceLatitude());
            return !0;

          case 'xRings':
            var d = this.readUint8();
            for (let e = 0; e < d; e++) {
                let e = new Array;
                i = this.readUint16();
                for (let t = 0; t < i; t++) e.push(this.deIceLongitude());
                a.push(e);
            }
            return !0;

          case 'yRings':
            d = this.readUint8();
            for (let e = 0; e < d; e++) {
                let e = new Array;
                n = this.readUint16();
                for (let t = 0; t < n; t++) e.push(this.deIceLatitude());
                s.push(e);
            }
            return !0;

          case 'lngCoord':
            return a.push(Math.fround(this.readFloat32())), !0;

          case 'latCoord':
            return s.push(Math.fround(this.readFloat32())), !0;

          case 'lngSegment':
            var o = this.readUint16();
            for (let e = 0; e < o; e++) a.push(Math.fround(this.readFloat32()));
            return !0;

          case 'latSegment':
            var h = this.readUint16();
            for (let e = 0; e < h; e++) s.push(Math.fround(this.readFloat32()));
            return !0;

          case 'lngRings':
            d = this.readUint8();
            for (let e = 0; e < d; e++) {
                let e = new Array;
                o = this.readUint16();
                for (let t = 0; t < o; t++) e.push(this.readFloat32());
                a.push(e);
            }
            return !0;

          case 'latRings':
            d = this.readUint8();
            for (let e = 0; e < d; e++) {
                let e = new Array;
                h = this.readUint16();
                for (let t = 0; t < h; t++) e.push(this.readFloat32());
                s.push(e);
            }
            return !0;

          default:
            return this.handleProperties(e, t, r, null);
        }
    }
    handleProperties(e, t, r, a) {
        if (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), expect(t, 'String'), 
        expect(r, 'String'), expect(a, 'null'), -1 != r.indexOf('[]')) {
            var s = new Array;
            e.kvPairs[t] = s;
            var i = this.readUint8();
            switch (r) {
              case 'tinyUint[]':
                for (let e = 0; e < i; e++) s.push(this.readUint8());
                return !0;

              case 'shortUint[]':
                for (let e = 0; e < i; e++) s.push(this.readUint16());
                return !0;

              case 'longUint[]':
                for (let e = 0; e < i; e++) s.push(this.readUint32());
                return !0;

              case 'tinyInt[]':
                for (let e = 0; e < i; e++) s.push(this.readInt8());
                return !0;

              case 'shortInt[]':
                for (let e = 0; e < i; e++) s.push(this.readInt16());
                return !0;

              case 'longInt[]':
                for (let e = 0; e < i; e++) s.push(this.readInt32());
                return !0;

              case 'float[]':
                for (let e = 0; e < i; e++) s.push(this.readFloat32());
                return !0;

              case 'string[]':
                for (let e = 0; e < i; e++) s.push(this.readLenPrefixedText());
                return !0;

              default:
                return terminal.abnormal(`unexpected propertyType '${r}' for propertyName ${t}, everything else is now suspect`), 
                !1;
            }
        }
        switch (r) {
          case 'tinyUint':
            return e.kvPairs[t] = this.readUint8(), !0;

          case 'shortUint':
            return e.kvPairs[t] = this.readUint16(), !0;

          case 'longUint':
            return e.kvPairs[t] = this.readUint32(), !0;

          case 'tinyInt':
            return e.kvPairs[t] = this.readInt8(), !0;

          case 'shortInt':
            return e.kvPairs[t] = this.readInt16(), !0;

          case 'longInt':
            return e.kvPairs[t] = this.readInt32(), !0;

          case 'float':
            return e.kvPairs[t] = Number(this.readFloat32().toFixed(2)), !0;

          case 'string':
            return e.kvPairs[t] = this.readLenPrefixedText(), !0;

          case 'json':
            return e.kvPairs[t] = JSON.parse(this.readLenPrefixedText()), !0;

          default:
            return terminal.abnormal(`unexpected propertyType '${r}' for propertyName ${t}, everything else is now suspect`), 
            !1;
        }
    }
    readMarker() {
        var e = this.payload.getUint32(this.payloadOffset, !0);
        return this.payloadOffset += 4, e;
    }
    readUint8() {
        var e = this.payload.getUint8(this.payloadOffset, !0);
        return this.payloadOffset += 1, e;
    }
    readUint16() {
        var e = this.payload.getUint16(this.payloadOffset, !0);
        return this.payloadOffset += 2, e;
    }
    readUint32() {
        var e = this.payload.getUint32(this.payloadOffset, !0);
        return this.payloadOffset += 4, e;
    }
    readInt8() {
        var e = this.payload.getInt8(this.payloadOffset, !0);
        return this.payloadOffset += 1, e;
    }
    readInt16() {
        var e = this.payload.getInt16(this.payloadOffset, !0);
        return this.payloadOffset += 2, e;
    }
    readInt32() {
        var e = this.payload.getInt32(this.payloadOffset, !0);
        return this.payloadOffset += 4, e;
    }
    readFloat32() {
        var e = this.payload.getFloat32(this.payloadOffset, !0);
        return this.payloadOffset += 4, e;
    }
    readLenPrefixedText() {
        var e = this.payload.getUint8(this.payloadOffset, !1);
        if (0 == e) return this.payloadOffset = this.payloadOffset + 1, null;
        if (e < 128) {
            let t = this.payloadOffset + 1, r = t + e, a = (new TextDecoder).decode(this.payload.buffer.slice(t, r));
            return this.payloadOffset = this.payloadOffset + 1 + e, a;
        }
        {
            e = this.payload.getUint16(this.payloadOffset, !1) - 32768;
            let t = this.payloadOffset + 2, r = t + e, a = (new TextDecoder).decode(this.payload.buffer.slice(t, r));
            return this.payloadOffset = this.payloadOffset + 2 + e, a;
        }
    }
}