/* Copyright (c) 2022 Read Write Tools. */
import EncodedParser from './encoded-parser.class.js';

import * as SectionMarker from '../util/section-marker.js';

import Coords from '../util/coords.class.js';

import { Arc } from '../tae/topology.class.js';

import { PolygonRing } from '../gcs/gcs-polygon-feature.class.js';

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
          case SectionMarker.MERIDIANS[0]:
            this.numMeridians = this.readUint32(), this.readMeridians();
            break;

          case SectionMarker.PARALLELS[0]:
            this.numParallels = this.readUint32(), this.readParallels();
            break;

          case SectionMarker.COORDINATES[0]:
            this.numCoordinates = this.readUint32(), this.readCoordinates();
            break;

          case SectionMarker.ARCS[0]:
            this.numArcs = this.readUint32(), this.readArcs();
            break;

          case SectionMarker.DATASET[0]:
            this.datasetName = this.readLenPrefixedText();
            break;

          case SectionMarker.GEOMETRY[0]:
            this.geometryType = this.readLenPrefixedText();
            break;

          case SectionMarker.PROPERTIES[0]:
            this.numProperties = this.readUint8(), this.readProperties();
            break;

          case SectionMarker.FEATURES[0]:
            this.numFeatures = this.readUint32(), this.readFeatures();
            break;

          case SectionMarker.END[0]:
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
    readCoordinates() {
        if (expect(this.numCoordinates, 'Number'), aver(this.numCoordinates >= 0), 'taebin' != this.format) return terminal.logic(`Only Topological Arc Encoding(TAEBIN) expects a coordinates section ${this.url}`), 
        !1;
        for (let s = 0; s < this.numCoordinates; s++) {
            var e = Math.fround(this.readFloat32()), t = Math.fround(this.readFloat32()), r = new Coords(e, t);
            this.topology.taeCoords.addVertex(r);
        }
        return aver(this.numCoordinates == this.topology.taeCoords.length - 1), !0;
    }
    readArcs() {
        if (expect(this.numArcs, 'Number'), aver(this.numArcs >= 0), 'taebin' != this.format) return terminal.logic(`Only Topological Arc Encoding(TAEBIN) expects an arc section ${this.url}`), 
        !1;
        this.determineBitsNeededForArcs();
        for (let t = 0; t < this.numArcs; t++) {
            var e = new Arc;
            const t = this.readUint8();
            aver(t <= 256);
            for (let r = 0; r < t; r++) 16 == this.arcIndexLenBits ? e.push(this.readUint16()) : e.push(this.readUint32());
            this.topology.taeArcs.push(e);
        }
        return aver(this.numArcs == this.topology.taeArcs.length - 1), !0;
    }
    determineBitsNeededForArcs() {
        this.arcRefLenBits = this.readUint8(), this.numArcs < 32767 ? this.arcIndexLenBits = 16 : this.arcIndexLenBits = 32;
    }
    readProperties() {
        expect(this.numProperties, 'Number'), aver(this.numProperties >= 0);
        for (let e = 0; e < this.numProperties; e++) this.propertyNames.push(this.readLenPrefixedText());
        for (let e = 0; e < this.numProperties; e++) this.propertyTypes.push(this.readLenPrefixedText());
        return aver(this.numProperties == this.propertyNames.length), aver(this.numProperties == this.propertyTypes.length), 
        !0;
    }
    readFeatureProperties(e, t, r, s, a) {
        switch (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), 
        expect(t, 'String'), expect(r, 'String'), expect(s, 'Array'), expect(a, 'Array'), 
        t) {
          case 'xCoord':
            return s.push(this.deIceLongitude()), !0;

          case 'yCoord':
            return a.push(this.deIceLatitude()), !0;

          case 'xSegment':
            var i = this.readUint16();
            for (let e = 0; e < i; e++) s.push(this.deIceLongitude());
            return !0;

          case 'ySegment':
            var n = this.readUint16();
            for (let e = 0; e < n; e++) a.push(this.deIceLatitude());
            return !0;

          case 'xRings':
            var o = this.readUint8();
            for (let e = 0; e < o; e++) {
                let e = new Array;
                i = this.readUint16();
                for (let t = 0; t < i; t++) e.push(this.deIceLongitude());
                s.push(e);
            }
            return !0;

          case 'yRings':
            o = this.readUint8();
            for (let e = 0; e < o; e++) {
                let e = new Array;
                n = this.readUint16();
                for (let t = 0; t < n; t++) e.push(this.deIceLatitude());
                a.push(e);
            }
            return !0;

          case 'lngCoord':
            return s.push(Math.fround(this.readFloat32())), !0;

          case 'latCoord':
            return a.push(Math.fround(this.readFloat32())), !0;

          case 'lngSegment':
            var d = this.readUint16();
            for (let e = 0; e < d; e++) s.push(Math.fround(this.readFloat32()));
            return !0;

          case 'latSegment':
            var h = this.readUint16();
            for (let e = 0; e < h; e++) a.push(Math.fround(this.readFloat32()));
            return !0;

          case 'lngRings':
            o = this.readUint8();
            for (let e = 0; e < o; e++) {
                let e = new Array;
                d = this.readUint16();
                for (let t = 0; t < d; t++) e.push(this.readFloat32());
                s.push(e);
            }
            return !0;

          case 'latRings':
            o = this.readUint8();
            for (let e = 0; e < o; e++) {
                let e = new Array;
                h = this.readUint16();
                for (let t = 0; t < h; t++) e.push(this.readFloat32());
                a.push(e);
            }
            return !0;

          case 'arcRefs':
            o = this.readUint8();
            this.readRingArcRefs(e.outerRing);
            const l = o - 1;
            for (let t = 0; t < l; t++) e.innerRings.push(new PolygonRing), this.readRingArcRefs(e.innerRings[t]);
            return !0;

          default:
            return this.handleProperties(e, t, r, null);
        }
    }
    readRingArcRefs(e) {
        if (expect(e, 'PolygonRing'), 8 == this.arcRefLenBits) var t = this.readUint8(); else t = this.readUint16();
        for (let d = 0; d < t; d++) {
            if (16 == this.arcIndexLenBits) var r = this.readInt16(); else r = this.readInt32();
            var s = Math.abs(r), a = this.topology.taeArcs[s];
            if (r < 0) var i = a.getReverseIndexes(); else i = a;
            for (let t = 0; t < i.length - 1; t++) {
                var n = i[t], o = this.topology.taeCoords[n];
                e.push(o);
            }
        }
    }
    handleProperties(e, t, r, s) {
        if (expect(e, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]), expect(t, 'String'), 
        expect(r, 'String'), expect(s, 'null'), -1 != r.indexOf('[]')) {
            var a = new Array;
            e.kvPairs[t] = a;
            var i = this.readUint8();
            switch (r) {
              case 'tinyUint[]':
                for (let e = 0; e < i; e++) a.push(this.readUint8());
                return !0;

              case 'shortUint[]':
                for (let e = 0; e < i; e++) a.push(this.readUint16());
                return !0;

              case 'longUint[]':
                for (let e = 0; e < i; e++) a.push(this.readUint32());
                return !0;

              case 'tinyInt[]':
                for (let e = 0; e < i; e++) a.push(this.readInt8());
                return !0;

              case 'shortInt[]':
                for (let e = 0; e < i; e++) a.push(this.readInt16());
                return !0;

              case 'longInt[]':
                for (let e = 0; e < i; e++) a.push(this.readInt32());
                return !0;

              case 'float[]':
                for (let e = 0; e < i; e++) a.push(this.readFloat32());
                return !0;

              case 'string[]':
                for (let e = 0; e < i; e++) a.push(this.readLenPrefixedText());
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
            let t = this.payloadOffset + 1, r = t + e, s = (new TextDecoder).decode(this.payload.buffer.slice(t, r));
            return this.payloadOffset = this.payloadOffset + 1 + e, s;
        }
        {
            e = this.payload.getUint16(this.payloadOffset, !1) - 32768;
            let t = this.payloadOffset + 2, r = t + e, s = (new TextDecoder).decode(this.payload.buffer.slice(t, r));
            return this.payloadOffset = this.payloadOffset + 2 + e, s;
        }
    }
}