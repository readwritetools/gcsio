/* Copyright (c) 2022 Read Write Tools. */
import EncodedSerializer from './encoded-serializer.class.js';

import * as SectionMarker from '../util/section-marker.js';

import StringBuilder from './builders/string-builder.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

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
          case 'gfe':
            return void this.stringBuilder.putline(SectionMarker.GFE_PROLOG[1]);

          case 'ice':
            return void this.stringBuilder.putline(SectionMarker.ICE_PROLOG[1]);

          case 'tae':
            return void (this.debugTopology ? this.stringBuilder.putline(SectionMarker.TAE_PROLOG[2]) : this.stringBuilder.putline(SectionMarker.TAE_PROLOG[1]));

          default:
            terminal.logic(`expected 'gfe', 'ice' or 'tae' but got ${this.format}`);
        }
    }
    writeMeridiansAndParallels() {
        if ('ice' != this.format) return;
        const t = SectionMarker.toString(SectionMarker.MERIDIANS), e = this.indexedCoordinates.meridians.length;
        this.stringBuilder.putline(`${t} ${e}`);
        for (let t = 0; t < e; t++) {
            let e = this.indexedCoordinates.meridians[t], i = this.toAccuracy(e);
            this.stringBuilder.putline(i);
        }
        const i = SectionMarker.toString(SectionMarker.PARALLELS), r = this.indexedCoordinates.parallels.length;
        this.stringBuilder.putline(`${i} ${r}`);
        for (let t = 0; t < r; t++) {
            let e = this.indexedCoordinates.parallels[t], i = this.toAccuracy(e);
            this.stringBuilder.putline(i);
        }
    }
    writeCoordinates() {
        if ('tae' != this.format) return;
        const t = SectionMarker.toString(SectionMarker.COORDINATES), e = this.topology.taeCoords.length;
        this.stringBuilder.putline(`${t} ${e - 1}`);
        for (let t = 1; t < e; t++) {
            var i = this.topology.taeCoords.lngLatFromCoordsIndex(t);
            let e = this.toAccuracy(i.longitude), r = this.toAccuracy(i.latitude);
            this.debugTopology ? this.stringBuilder.putline(`Coords[${t}] ${e},${r}`) : this.stringBuilder.putline(`${e},${r}`);
        }
    }
    writeEdges() {
        if ('tae' == this.format && this.debugTopology) {
            const r = SectionMarker.toString(SectionMarker.EDGES), n = this.topology.taeEdges.length;
            this.stringBuilder.putline(`${r} ${n - 1}`);
            for (let r = 1; r < this.topology.taeEdges.length; r++) {
                var t = this.topology.taeEdges[r], e = this.topology.taeCoords.lngLatFromCoordsIndex(t.coordsIndexA);
                let n = this.toAccuracy(e.longitude), s = this.toAccuracy(e.latitude);
                var i = this.topology.taeCoords.lngLatFromCoordsIndex(t.coordsIndexB);
                let o = this.toAccuracy(i.longitude), a = this.toAccuracy(i.latitude), l = `${t.forwardRing.polygonName}-${t.forwardRing.type}`, g = null == t.reverseRing ? 'null' : `${t.reverseRing.polygonName}-${t.reverseRing.type}`;
                this.stringBuilder.putline(`Edge[${r}] forwardMapKey(${t.forwardMapKey})  coordsA(${n},${s})  coordsB(${o},${a})  forward[${l}]   reverse[${g}]`);
            }
        }
    }
    writeArcs() {
        if ('tae' != this.format) return;
        const t = SectionMarker.toString(SectionMarker.ARCS), e = this.topology.taeArcs.length;
        this.stringBuilder.putline(`${t} ${e - 1}`);
        for (let t = 1; t < e; t++) {
            let e = this.topology.taeArcs[t];
            if (this.debugTopology) {
                var i = [];
                for (let t = 0; t < e.length; t++) {
                    var r = e[t], n = this.topology.taeCoords.lngLatFromCoordsIndex(r);
                    let s = this.toAccuracy(n.longitude), o = this.toAccuracy(n.latitude);
                    i.push(`[${r}](${s},${o})`);
                }
                this.stringBuilder.putline(`Arc[${t}] {${e.join(',')}}  ${i.join(' ')}`);
            } else this.stringBuilder.putline(e.join(','));
        }
    }
    writeDatasetPreliminaries(t) {
        expect(t, 'String');
        const e = SectionMarker.toString(SectionMarker.DATASET);
        this.stringBuilder.putline(`${e} ${this.datasetId}`);
        const i = SectionMarker.toString(SectionMarker.GEOMETRY);
        this.stringBuilder.putline(`${i} ${t}`);
        const r = SectionMarker.toString(SectionMarker.PROPERTIES), {userRequestedProperties: n, propertyNames: s, propertyTypes: o} = this.getPropertyNamesAndTypes(this.propertiesToInclude, t), a = s.length;
        return this.stringBuilder.putline(`${r} ${a}`), this.stringBuilder.putline(s.join(',')), 
        this.stringBuilder.putline(o.join(',')), n;
    }
    beginFeatures(t) {
        const e = SectionMarker.toString(SectionMarker.FEATURES);
        this.stringBuilder.putline(`${e} ${t}`);
    }
    endFeatures() {
        const t = SectionMarker.toString(SectionMarker.END);
        this.stringBuilder.putline(t);
    }
    writePointDataset() {
        var t = this.gcsFeaturePoints.length;
        if (0 != t) {
            var e = this.writeDatasetPreliminaries('Point');
            this.beginFeatures(t);
            for (let t of this.gcsFeaturePoints) {
                if ('ice' == this.format) {
                    var i = this.indexedCoordinates.getIceX(t.discretePoint.longitude), r = this.indexedCoordinates.getIceY(t.discretePoint.latitude);
                    this.propertyToString('xCoord', i.toString()), this.propertyToString('yCoord', r.toString());
                } else 'gfe' == this.format && (this.propertyToString('lngCoord', this.toAccuracy(t.discretePoint.longitude)), 
                this.propertyToString('latCoord', this.toAccuracy(t.discretePoint.latitude)));
                for (let i = 0; i < e.length; i++) {
                    var n = e[i];
                    t.kvPairs.hasOwnProperty(n) ? this.propertyToString(n, t.kvPairs[n]) : this.propertyToString(n, '');
                }
            }
            this.endFeatures();
        }
    }
    writeLineDataset() {
        var t = this.gcsFeatureLines.length;
        if (0 != t) {
            var e = this.writeDatasetPreliminaries('Line');
            this.beginFeatures(t);
            for (let t of this.gcsFeatureLines) {
                var i = [];
                for (let e = 0; e < t.lineSegment.length; e++) this.buildLongitudes(i, t.lineSegment[e]);
                'ice' == this.format ? this.propertyToString('xSegment', i) : 'gfe' == this.format && this.propertyToString('lngSegment', i), 
                i = [];
                for (let e = 0; e < t.lineSegment.length; e++) this.buildLatitudes(i, t.lineSegment[e]);
                'ice' == this.format ? this.propertyToString('ySegment', i) : 'gfe' == this.format && this.propertyToString('latSegment', i);
                for (let i = 0; i < e.length; i++) {
                    var r = e[i];
                    t.kvPairs.hasOwnProperty(r) ? this.propertyToString(r, t.kvPairs[r]) : this.propertyToString(r, '');
                }
            }
            this.endFeatures();
        }
    }
    writePolygonDataset() {
        var t = this.gcsFeaturePolygons.length;
        if (0 != t) {
            var e = this.writeDatasetPreliminaries('Polygon');
            this.beginFeatures(t);
            for (let t of this.gcsFeaturePolygons) {
                if ('ice' == this.format || 'gfe' == this.format) {
                    var i = new Array;
                    this.addLongitudeLinearRing(i, t.outerRing);
                    for (let e = 0; e < t.innerRings.length; e++) this.addLongitudeLinearRing(i, t.innerRings[e]);
                    'ice' == this.format ? this.propertyToString('xRings', i) : 'gfe' == this.format && this.propertyToString('lngRings', i), 
                    i = new Array, this.addLatitudeLinearRing(i, t.outerRing);
                    for (let e = 0; e < t.innerRings.length; e++) this.addLatitudeLinearRing(i, t.innerRings[e]);
                    'ice' == this.format ? this.propertyToString('yRings', i) : 'gfe' == this.format && this.propertyToString('latRings', i);
                }
                if ('tae' == this.format) {
                    if (this.debugTopology) {
                        i = new Array;
                        this.addEdgeRefs(i, t.outerRing);
                        for (let e = 0; e < t.innerRings.length; e++) this.addEdgeRefs(i, t.innerRings[e]);
                        this.propertyToString('edgeRefs', i);
                    }
                    if (this.debugTopology) {
                        i = new Array;
                        this.addEdges(i, t.outerRing);
                        for (let e = 0; e < t.innerRings.length; e++) this.addEdges(i, t.innerRings[e]);
                        this.propertyToString('edgePairs', i);
                    }
                    i = new Array;
                    this.addArcRefs(i, t.outerRing);
                    for (let e = 0; e < t.innerRings.length; e++) this.addArcRefs(i, t.innerRings[e]);
                    if (this.propertyToString('arcRefs', i), this.debugTopology) {
                        i = new Array;
                        this.addArcCoords(i, t.outerRing);
                        for (let e = 0; e < t.innerRings.length; e++) this.addArcCoords(i, t.innerRings[e]);
                        this.propertyToString('arcCoords', i);
                    }
                }
                for (let i = 0; i < e.length; i++) {
                    var r = e[i];
                    t.kvPairs.hasOwnProperty(r) ? this.propertyToString(r, t.kvPairs[r]) : this.propertyToString(r, '');
                }
            }
            this.endFeatures();
        }
    }
    addLongitudeLinearRing(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
        var i = new Array;
        for (let t = 0; t < e.length - 1; t++) this.buildLongitudes(i, e[t]);
        t.push(i);
    }
    addLatitudeLinearRing(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
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
    addEdgeRefs(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
        var i = new Array;
        for (let t = 0; t < e.edgeRefs.length; t++) i.push(e.edgeRefs[t]);
        t.push(i);
    }
    addEdges(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
        var i = new Array;
        for (let t = 0; t < e.edgeRefs.length; t++) {
            var r = e.edgeRefs[t], n = Math.abs(r), s = this.topology.taeEdges[n];
            if (r < 0) var o = `Edge[${r}](${s.reverseMapKey})`; else o = `Edge[${r}](${s.forwardMapKey})`;
            i.push(o);
        }
        t.push(i);
    }
    addArcRefs(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
        var i = new Array;
        for (let t = 0; t < e.arcRefs.length; t++) i.push(e.arcRefs[t]);
        t.push(i);
    }
    addArcCoords(t, e) {
        expect(t, 'Array'), expect(e, 'PolygonRing');
        var i = new Array;
        for (let t = 0; t < e.arcRefs.length; t++) {
            var r = e.arcRefs[t], n = Math.abs(r), s = this.topology.taeArcs[n];
            r < 0 ? i.push(`Arc[${r}]{${s.getReverseIndexes().join(',')}}`) : i.push(`Arc[${r}]{${s.join(',')}}`);
        }
        t.push(i);
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
          case 'arcRefs':
            expect(e, 'Array');
            var i = [];
            for (let t = 0; t < e.length; t++) i.push(e[t].join(','));
            return void this.stringBuilder.putline(i.join('|'));

          case 'edgeRefs':
          case 'edgePairs':
          case 'arcCoords':
            if (this.debugTopology) {
                expect(e, 'Array');
                i = [];
                for (let t = 0; t < e.length; t++) i.push(e[t].join(','));
                return void this.stringBuilder.putline(i.join('|'));
            }

          case 'tinyInt':
          case 'tinyUint':
          case 'shortInt':
          case 'shortUint':
          case 'longInt':
          case 'longUint':
            return void (0 === e ? this.stringBuilder.putline(Math.round(e)) : null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(Math.round(e)));

          case 'tinyInt[]':
          case 'tinyUint[]':
          case 'shortInt[]':
          case 'shortUint[]':
          case 'longInt[]':
          case 'longUint[]':
            return expect(e, 'Array'), void (0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(e.map((t => Math.round(t))).join(',')));

          case 'float':
            return void (0 === e ? this.stringBuilder.putline(e.toFixed(this.accuracy)) : 'null' == e || null == e || null == e || '' == e ? this.stringBuilder.putline(null) : this.stringBuilder.putline(Number(e).toFixed(this.accuracy)));

          case 'float[]':
            return expect(e, 'Array'), void (0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(e.map((t => t.toFixed(this.accuracy))).join(',')));

          case 'string':
            return void (null == e ? this.stringBuilder.putline('') : this.stringBuilder.putline(e));

          case 'string[]':
            return void (null == e || 0 == e.length ? this.stringBuilder.putline('') : this.stringBuilder.putline(JSON.stringify(e)));

          case 'json':
            return void (null == e || null == e || '' == e ? this.stringBuilder.putline('{}') : this.stringBuilder.putline(JSON.stringify(e)));

          default:
            return terminal.trace(`Ignoring unknown property name ${t} with value ${e}`), void this.stringBuilder.putline('');
        }
    }
}