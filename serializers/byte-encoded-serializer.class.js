/* Copyright (c) 2022 Read Write Tools. */
import EncodedSerializer from './encoded-serializer.class.js';

import * as IceMarker from '../ice/ice-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.js';

import ByteBuilder from './builders/byte-builder.class.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class ByteEncodedSerializer extends EncodedSerializer {
    constructor(e, t, i, r, n, s) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), expect(i, 'Number'), expect(r, 'String'), 
        expect(n, 'Array'), expect(s, 'Map'), super(e, t, i, r, n, s), this.byteBuilder = new ByteBuilder, 
        Object.seal(this);
    }
    serialize() {
        return super.serialize(), this.byteBuilder.build();
    }
    writeProlog() {
        switch (this.format) {
          case 'icebin':
            return void this.byteBuilder.writeText(IceMarker.ICE_PROLOG[0]);

          case 'gfebin':
            return void this.byteBuilder.writeText(IceMarker.GFE_PROLOG[0]);

          default:
            terminal.logic(`expected 'ice', 'icebin', 'gfe' or 'gfebin' but got ${this.format}`);
        }
    }
    writeCoordinates() {
        if ('gfebin' == this.format) return;
        this.buildIndexedCoordinates();
        const e = IceMarker.toBin(IceMarker.MERIDIANS);
        this.byteBuilder.writeMarker(e), this.byteBuilder.writeUint32(this.indexedCoordinates.meridians.length);
        for (let e = 0; e < this.indexedCoordinates.meridians.length; e++) this.byteBuilder.writeFloat32(this.indexedCoordinates.meridians[e]);
        const t = IceMarker.toBin(IceMarker.PARALLELS);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeUint32(this.indexedCoordinates.parallels.length);
        for (let e = 0; e < this.indexedCoordinates.parallels.length; e++) this.byteBuilder.writeFloat32(this.indexedCoordinates.parallels[e]);
    }
    writeDatasetPreliminaries(e) {
        expect(e, 'String');
        const t = IceMarker.toBin(IceMarker.DATASET);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeLenPrefixedText(this.datasetId);
        const i = IceMarker.toBin(IceMarker.GEOMETRY);
        this.byteBuilder.writeMarker(i), this.byteBuilder.writeLenPrefixedText(e);
        const r = IceMarker.toBin(IceMarker.PROPERTIES), {propertyNames: n, propertyTypes: s} = this.getPropertyNamesAndTypes(this.propertiesToInclude, e), o = n.length;
        this.byteBuilder.writeMarker(r), this.byteBuilder.writeUint8(o);
        for (let e = 0; e < n.length; e++) this.byteBuilder.writeLenPrefixedText(n[e]);
        for (let e = 0; e < s.length; e++) this.byteBuilder.writeLenPrefixedText(s[e]);
    }
    beginFeatures(e) {
        const t = IceMarker.toBin(IceMarker.FEATURES);
        this.byteBuilder.writeMarker(t), this.byteBuilder.writeUint32(e);
    }
    endFeatures() {
        const e = IceMarker.toBin(IceMarker.END);
        this.byteBuilder.writeMarker(e);
    }
    writePointDataset() {
        var e = this.gcsFeaturePoints.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Point'), this.beginFeatures(e);
            for (let e of this.gcsFeaturePoints) {
                'icebin' == this.format ? (this.propertyToBin('xCoord', e.discretePoint, this.indexedCoordinates.packedWidth), 
                this.propertyToBin('yCoord', e.discretePoint, this.indexedCoordinates.packedWidth)) : 'gfebin' == this.format && (this.propertyToBin('lngCoord', e.discretePoint), 
                this.propertyToBin('latCoord', e.discretePoint));
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToBin(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    writeLineDataset() {
        var e = this.gcsFeatureLines.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Line'), this.beginFeatures(e);
            for (let e of this.gcsFeatureLines) {
                'icebin' == this.format ? (this.propertyToBin('xSegment', e.lineSegment, this.indexedCoordinates.packedWidth), 
                this.propertyToBin('ySegment', e.lineSegment, this.indexedCoordinates.packedWidth)) : 'gfebin' == this.format && (this.propertyToBin('lngSegment', e.lineSegment), 
                this.propertyToBin('latSegment', e.lineSegment));
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToBin(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    writePolygonDataset() {
        var e = this.gcsFeaturePolygons.length;
        if (0 != e) {
            this.writeDatasetPreliminaries('Polygon'), this.beginFeatures(e);
            for (let e of this.gcsFeaturePolygons) {
                var t = 1 + e.innerRings.length;
                this.byteBuilder.writeUint8(t), this.writeLongitudeLinearRing(e.outerRing);
                for (let t = 0; t < e.innerRings.length; t++) this.writeLongitudeLinearRing(e.innerRings[t]);
                t = 1 + e.innerRings.length;
                this.byteBuilder.writeUint8(t), this.writeLatitudeLinearRing(e.outerRing);
                for (let t = 0; t < e.innerRings.length; t++) this.writeLatitudeLinearRing(e.innerRings[t]);
                for (let t in e.kvPairs) this.isPropertyWanted(t) && this.propertyToBin(t, e.kvPairs[t]);
            }
            this.endFeatures();
        }
    }
    writeLongitudeLinearRing(e) {
        expect(e, 'Array'), 'icebin' == this.format ? this.propertyToBin('xRings', e, this.indexedCoordinates.packedWidth) : 'gfebin' == this.format && this.propertyToBin('lngRings', e);
    }
    writeLatitudeLinearRing(e) {
        expect(e, 'Array'), 'icebin' == this.format ? this.propertyToBin('yRings', e, this.indexedCoordinates.packedWidth) : 'gfebin' == this.format && this.propertyToBin('latRings', e);
    }
    propertyToBin(e, t, i) {
        expect(i, [ 'Number', 'undefined' ]);
        var r = this.getPropertyType(e);
        switch (r) {
          case 'xCoord':
            var n = this.indexedCoordinates.getIceX(t.longitude);
            return void (2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n));

          case 'yCoord':
            var s = this.indexedCoordinates.getIceY(t.latitude);
            return void (2 == i ? this.byteBuilder.writeUint16(s) : this.byteBuilder.writeUint32(s));

          case 'xSegment':
            expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length);
            for (let e = 0; e < t.length; e++) {
                n = this.indexedCoordinates.getIceX(t[e].longitude);
                2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n);
            }
            return;

          case 'ySegment':
            expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length);
            for (let e = 0; e < t.length; e++) {
                s = this.indexedCoordinates.getIceY(t[e].latitude);
                2 == i ? this.byteBuilder.writeUint16(s) : this.byteBuilder.writeUint32(s);
            }
            return;

          case 'xRings':
            expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length);
            for (let e = 0; e < t.length; e++) {
                n = this.indexedCoordinates.getIceX(t[e].longitude);
                2 == i ? this.byteBuilder.writeUint16(n) : this.byteBuilder.writeUint32(n);
            }
            return;

          case 'yRings':
            expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length);
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
            return expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e.longitude)));

          case 'latSegment':
            return expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e.latitude)));

          case 'lngRings':
            return expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e.longitude)));

          case 'latRings':
            return expect(t, 'Array'), aver(t.length <= 65536), this.byteBuilder.writeUint16(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e.latitude)));

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
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt8(e)));

          case 'tinyUint[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint8(e)));

          case 'shortInt[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt16(e)));

          case 'shortUint[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint16(e)));

          case 'longInt[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeInt32(e)));

          case 'longUint[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeUint32(e)));

          case 'float':
            return void this.byteBuilder.writeFloat32(t);

          case 'float[]':
            return expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length), 
            void t.forEach((e => this.byteBuilder.writeFloat32(e)));

          case 'string':
            return void (null == t ? this.byteBuilder.writeUint8(0) : this.byteBuilder.writeLenPrefixedText(t));

          case 'string[]':
            expect(t, 'Array'), aver(t.length <= 256), this.byteBuilder.writeUint8(t.length);
            for (let e = 0; e < t.length; e++) this.byteBuilder.writeLenPrefixedText(t[e]);
            return;

          case 'json':
            return void (null == t || null == t ? this.byteBuilder.writeLenPrefixedText('{}') : this.byteBuilder.writeLenPrefixedText(JSON.stringify(t)));

          default:
            return terminal.trace(`Ignoring unknown property type ${r} for property pair ${e} = ${t}`), 
            void this.byteBuilder.writeUint8(0);
        }
    }
}