/* Copyright (c) 2022 Read Write Tools. */
import EncodedSerializer from './encoded-serializer.class.js';

import * as SectionMarker from '../util/section-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.class.js';

import ByteBuilder from './builders/byte-builder.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class ByteEncodedSerializer extends EncodedSerializer {
    constructor(e, t, i, r, n, s) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), expect(i, 'Number'), expect(r, 'String'), 
        expect(n, 'Array'), expect(s, 'Map'), super(e, t, i, r, n, s), this.byteBuilder = new ByteBuilder, 
        this.arcRefLenBits = 0, this.arcIndexLenBits = 0, this.coordsIndexLenBits = 0, Object.seal(this);
    }
    serialize() {
        return super.serialize(), this.byteBuilder.build();
    }
    writeProlog() {
        switch (this.format) {
          case 'icebin':
            return void this.byteBuilder.writeText(SectionMarker.ICE_PROLOG[0]);

          case 'gfebin':
            return void this.byteBuilder.writeText(SectionMarker.GFE_PROLOG[0]);

          case 'taebin':
            return void this.byteBuilder.writeText(SectionMarker.TAE_PROLOG[0]);

          default:
            terminal.logic(`expected 'gfebin', 'icebin' or 'taebin' but got ${this.format}`);
        }
    }
    writeMeridiansAndParallels() {
        if ('icebin' != this.format) return;
        const e = SectionMarker.toBin(SectionMarker.MERIDIANS);
        this.byteBuilder.writeMarker(e), this.byteBuilder.writeUint32(this.indexedCoordinates.meridians.length);
        for (let e = 0; e < this.indexedCoordinates.meridians.length; e++) this.byteBuilder.writeFloat32(this.indexedCoordinates.meridians[e]);
        const t = SectionMarker.toBin(SectionMarker.PARALLELS);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeUint32(this.indexedCoordinates.parallels.length);
        for (let e = 0; e < this.indexedCoordinates.parallels.length; e++) this.byteBuilder.writeFloat32(this.indexedCoordinates.parallels[e]);
    }
    writeCoordinates() {
        if ('taebin' != this.format) return;
        const e = SectionMarker.toBin(SectionMarker.COORDINATES);
        this.byteBuilder.writeMarker(e);
        const t = this.topology.taeCoords.length;
        this.byteBuilder.writeUint32(t - 1);
        for (let e = 1; e < t; e++) {
            var i = this.topology.taeCoords.lngLatFromCoordsIndex(e);
            this.byteBuilder.writeFloat32(i.longitude), this.byteBuilder.writeFloat32(i.latitude);
        }
    }
    writeArcs() {
        if ('taebin' != this.format) return;
        const e = SectionMarker.toBin(SectionMarker.ARCS);
        this.byteBuilder.writeMarker(e);
        const t = this.topology.taeArcs.length;
        this.byteBuilder.writeUint32(t - 1), this.determineBitsNeededForArcs(), this.byteBuilder.writeUint8(this.arcRefLenBits);
        for (let e = 1; e < t; e++) {
            var i = this.topology.taeArcs[e];
            aver(i.length <= 255), this.byteBuilder.writeUint8(i.length);
            for (let e = 0; e < i.length; e++) {
                var r = i[e];
                16 == this.coordsIndexLenBits ? this.byteBuilder.writeUint16(r) : this.byteBuilder.writeUint32(r);
            }
        }
    }
    determineBitsNeededForArcs() {
        var e = 0;
        for (let t of this.gcsFeaturePolygons) {
            e = Math.max(e, t.outerRing.arcRefs);
            for (let i = 0; i < t.innerRings.length; i++) e = Math.max(e, t.innerRings[i].arcRefs.length);
        }
        this.arcRefLenBits = e <= 255 ? 8 : e <= 65536 ? 16 : 32, this.topology.taeArcs.length < 32767 ? this.arcIndexLenBits = 16 : this.arcIndexLenBits = 32, 
        this.topology.taeCoords.length < 65536 ? this.coordsIndexLenBits = 16 : this.coordsIndexLenBits = 32;
    }
    writeDatasetPreliminaries(e) {
        expect(e, 'String');
        const t = SectionMarker.toBin(SectionMarker.DATASET);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeLenPrefixedText(this.datasetId);
        const i = SectionMarker.toBin(SectionMarker.GEOMETRY);
        this.byteBuilder.writeMarker(i), this.byteBuilder.writeLenPrefixedText(e);
        const r = SectionMarker.toBin(SectionMarker.PROPERTIES), {userRequestedProperties: n, propertyNames: s, propertyTypes: o} = this.getPropertyNamesAndTypes(this.propertiesToInclude, e), a = s.length;
        this.byteBuilder.writeMarker(r), this.byteBuilder.writeUint8(a);
        for (let e = 0; e < s.length; e++) this.byteBuilder.writeLenPrefixedText(s[e]);
        for (let e = 0; e < o.length; e++) this.byteBuilder.writeLenPrefixedText(o[e]);
        return n;
    }
    beginFeatures(e) {
        const t = SectionMarker.toBin(SectionMarker.FEATURES);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeUint32(e);
    }
    endFeatures() {
        const e = SectionMarker.toBin(SectionMarker.END);
        this.byteBuilder.writeMarker(e);
    }
    writePointDataset() {
        var e = this.gcsFeaturePoints.length;
        if (0 != e) {
            var t = this.writeDatasetPreliminaries('Point');
            this.beginFeatures(e);
            for (let e of this.gcsFeaturePoints) {
                'icebin' == this.format ? (this.propertyToBin('xCoord', e.discretePoint, this.indexedCoordinates.packedWidth), 
                this.propertyToBin('yCoord', e.discretePoint, this.indexedCoordinates.packedWidth)) : 'gfebin' == this.format && (this.propertyToBin('lngCoord', e.discretePoint), 
                this.propertyToBin('latCoord', e.discretePoint));
                for (let r = 0; r < t.length; r++) {
                    var i = t[r];
                    e.kvPairs.hasOwnProperty(i) ? this.propertyToBin(i, e.kvPairs[i]) : this.propertyToBin(i, null);
                }
            }
            this.endFeatures();
        }
    }
    writeLineDataset() {
        var e = this.gcsFeatureLines.length;
        if (0 != e) {
            var t = this.writeDatasetPreliminaries('Line');
            this.beginFeatures(e);
            for (let e of this.gcsFeatureLines) {
                'icebin' == this.format ? (this.propertyToBin('xSegment', e.lineSegment, this.indexedCoordinates.packedWidth), 
                this.propertyToBin('ySegment', e.lineSegment, this.indexedCoordinates.packedWidth)) : 'gfebin' == this.format && (this.propertyToBin('lngSegment', e.lineSegment), 
                this.propertyToBin('latSegment', e.lineSegment));
                for (let r = 0; r < t.length; r++) {
                    var i = t[r];
                    e.kvPairs.hasOwnProperty(i) ? this.propertyToBin(i, e.kvPairs[i]) : this.propertyToBin(i, null);
                }
            }
            this.endFeatures();
        }
    }
    writePolygonDataset() {
        var e = this.gcsFeaturePolygons.length;
        if (0 != e) {
            var t = this.writeDatasetPreliminaries('Polygon');
            this.beginFeatures(e);
            for (let e of this.gcsFeaturePolygons) {
                if ('icebin' == this.format || 'gfebin' == this.format) {
                    var i = 1 + e.innerRings.length;
                    this.byteBuilder.writeUint16(i), this.writeLongitudeLinearRing(e.outerRing);
                    for (let t = 0; t < e.innerRings.length; t++) this.writeLongitudeLinearRing(e.innerRings[t]);
                    i = 1 + e.innerRings.length;
                    this.byteBuilder.writeUint16(i), this.writeLatitudeLinearRing(e.outerRing);
                    for (let t = 0; t < e.innerRings.length; t++) this.writeLatitudeLinearRing(e.innerRings[t]);
                }
                if ('taebin' == this.format) {
                    i = 1 + e.innerRings.length;
                    this.byteBuilder.writeUint16(i), this.writeRingArcRefs(e.outerRing);
                    for (let t = 0; t < e.innerRings.length; t++) this.writeRingArcRefs(e.innerRings[t]);
                }
                for (let i = 0; i < t.length; i++) {
                    var r = t[i];
                    e.kvPairs.hasOwnProperty(r) ? this.propertyToBin(r, e.kvPairs[r]) : this.propertyToBin(r, null);
                }
            }
            this.endFeatures();
        }
    }
    writeRingArcRefs(e) {
        expect(e, 'PolygonRing'), aver('taebin' == this.format);
        var t = e.arcRefs.length;
        8 == this.arcRefLenBits ? this.byteBuilder.writeUint8(t) : 16 == this.arcRefLenBits ? this.byteBuilder.writeUint16(t) : this.byteBuilder.writeUint32(t);
        for (let r = 0; r < t; r++) {
            var i = e.arcRefs[r];
            16 == this.arcIndexLenBits ? this.byteBuilder.writeInt16(i) : this.byteBuilder.writeInt32(i);
        }
    }
    writeLongitudeLinearRing(e) {
        expect(e, 'PolygonRing'), 'icebin' == this.format ? this.propertyToBin('xRings', e, this.indexedCoordinates.packedWidth) : 'gfebin' == this.format && this.propertyToBin('lngRings', e);
    }
    writeLatitudeLinearRing(e) {
        expect(e, 'PolygonRing'), 'icebin' == this.format ? this.propertyToBin('yRings', e, this.indexedCoordinates.packedWidth) : 'gfebin' == this.format && this.propertyToBin('latRings', e);
    }
    propertyToBin(e, t, i) {
        expect(i, [ 'Number', 'undefined' ]);
        var r = this.getPropertyType(e);
        switch (null == t && -1 != r.indexOf('[]') && (t = []), r) {
          case 'xCoord':
            var n = this.indexedCoordinates.getIceX(t.longitude);
            return void (2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n));

          case 'yCoord':
            var s = this.indexedCoordinates.getIceY(t.latitude);
            return void (2 == i ? this.byteBuilder.writeUint16(s) : this.byteBuilder.writeUint32(s));

          case 'xSegment':
            expect(t, 'Array'), this.byteBuilder.writeUint32(t.length);
            for (let e = 0; e < t.length; e++) {
                n = this.indexedCoordinates.getIceX(t[e].longitude);
                2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n);
            }
            return;

          case 'ySegment':
            expect(t, 'Array'), this.byteBuilder.writeUint32(t.length);
            for (let e = 0; e < t.length; e++) {
                s = this.indexedCoordinates.getIceY(t[e].latitude);
                2 == i ? this.byteBuilder.writeUint16(s) : this.byteBuilder.writeUint32(s);
            }
            return;

          case 'xRings':
            expect(t, 'PolygonRing'), this.byteBuilder.writeUint32(t.length);
            for (let e = 0; e < t.length; e++) {
                n = this.indexedCoordinates.getIceX(t[e].longitude);
                2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n);
            }
            return;

          case 'yRings':
            expect(t, 'PolygonRing'), this.byteBuilder.writeUint32(t.length);
            for (let e = 0; e < t.length; e++) {
                s = this.indexedCoordinates.getIceY(t[e].latitude);
                2 == i ? this.byteBuilder.writeUint16(s) : this.byteBuilder.writeUint32(s);
            }
            return;

          case 'lngCoord':
            return void this.byteBuilder.writeFloat32(t.longitude);

          case 'latCoord':
            return void this.byteBuilder.writeFloat32(t.latitude);

          case 'lngSegment':
            return expect(t, 'Array'), this.byteBuilder.writeUint32(t.length), void t.forEach((e => this.byteBuilder.writeFloat32(e.longitude)));

          case 'latSegment':
            return expect(t, 'Array'), this.byteBuilder.writeUint32(t.length), void t.forEach((e => this.byteBuilder.writeFloat32(e.latitude)));

          case 'lngRings':
            return expect(t, 'PolygonRing'), this.byteBuilder.writeUint32(t.length), void t.forEach((e => this.byteBuilder.writeFloat32(e.longitude)));

          case 'latRings':
            return expect(t, 'PolygonRing'), this.byteBuilder.writeUint32(t.length), void t.forEach((e => this.byteBuilder.writeFloat32(e.latitude)));

          case 'tinyInt':
            return void this.byteBuilder.writeInt8(t);

          case 'tinyUint':
            return void this.byteBuilder.writeUint8(t);

          case 'shortInt':
            return void this.byteBuilder.writeInt16(t);

          case 'shortUint':
            return void this.byteBuilder.writeUint16(t);

          case 'longInt':
            return void this.byteBuilder.writeInt32(t);

          case 'longUint':
            return void this.byteBuilder.writeUint32(t);

          case 'tinyInt[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt8(e)));

          case 'tinyUint[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint8(e)));

          case 'shortInt[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt16(e)));

          case 'shortUint[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint16(e)));

          case 'longInt[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt32(e)));

          case 'longUint[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint32(e)));

          case 'float':
            return void this.byteBuilder.writeFloat32(Number(t));

          case 'float[]':
            return expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e)));

          case 'string':
            return void (null == t ? this.byteBuilder.writeUint8(0) : this.byteBuilder.writeLenPrefixedText(t));

          case 'string[]':
            expect(t, 'Array'), aver(t.length <= 255), this.byteBuilder.writeUint8(t.length);
            for (let e = 0; e < t.length; e++) this.byteBuilder.writeLenPrefixedText(t[e]);
            return;

          case 'json':
            return void (null == t || null == t || '' == t ? this.byteBuilder.writeLenPrefixedText('{}') : this.byteBuilder.writeLenPrefixedText(JSON.stringify(t)));

          default:
            return terminal.trace(`Ignoring unknown property type ${r} for property pair ${e} = ${t}`), 
            void this.byteBuilder.writeUint8(0);
        }
    }
}