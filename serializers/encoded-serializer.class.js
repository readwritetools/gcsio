/* Copyright (c) 2022 Read Write Tools. */
import * as IceMarker from '../ice/ice-marker.js';

import IndexedCoordinates from '../ice/indexed-coordinates.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class EncodedSerializer {
    constructor(e, t, i, s, r, n) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), expect(i, 'Number'), expect(s, 'String'), 
        expect(r, 'Array'), expect(n, 'Map'), this.gcsFeaturePoints = e.gcsFeaturePoints, 
        this.gcsFeatureLines = e.gcsFeatureLines, this.gcsFeaturePolygons = e.gcsFeaturePolygons, 
        this.indexedCoordinates = e.indexedCoordinates, this.format = t, this.accuracy = i, 
        this.datasetId = s, this.propertiesToInclude = r, this.declarations = n, this.buildDeclarations();
    }
    serialize() {
        try {
            this.writeProlog(), this.writeCoordinates(), this.writePointDataset(), this.writeLineDataset(), 
            this.writePolygonDataset();
        } catch (e) {
            return terminal.caught(e.message), null;
        }
    }
    buildIndexedCoordinates() {
        for (let e of this.gcsFeaturePoints) this.indexedCoordinates.registerLongitude(e.discretePoint.longitude), 
        this.indexedCoordinates.registerLatitude(e.discretePoint.latitude);
        for (let e of this.gcsFeatureLines) for (let t = 0; t < e.lineSegment.length; t++) this.indexedCoordinates.registerLongitude(e.lineSegment[t].longitude), 
        this.indexedCoordinates.registerLatitude(e.lineSegment[t].latitude);
        for (let t of this.gcsFeaturePolygons) {
            for (let e = 0; e < t.outerRing.length; e++) this.indexedCoordinates.registerLongitude(t.outerRing[e].longitude), 
            this.indexedCoordinates.registerLatitude(t.outerRing[e].latitude);
            for (let i = 0; i < t.innerRings.length; i++) {
                var e = t.innerRings[i];
                for (let t = 0; t < e.length; t++) this.indexedCoordinates.registerLongitude(e[t].longitude), 
                this.indexedCoordinates.registerLatitude(e[t].latitude);
            }
        }
    }
    getPropertyNamesAndTypes(e, t) {
        expect(e, 'Array'), expect(t, 'String');
        var i = [ ...e ];
        i = e.includes('all') ? this.examineHoldingAreaForProperties(t) : e.includes('none') ? [] : [ ...e ];
        var s = [];
        'ice' == this.format || 'icebin' == this.format ? 'Point' == t ? s = [ 'xCoord', 'yCoord', ...i ] : 'Line' == t ? s = [ 'xSegment', 'ySegment', ...i ] : 'Polygon' == t && (s = [ 'xRings', 'yRings', ...i ]) : 'gfe' == this.format || 'gfebin' == this.format ? 'Point' == t ? s = [ 'lngCoord', 'latCoord', ...i ] : 'Line' == t ? s = [ 'lngSegment', 'latSegment', ...i ] : 'Polygon' == t && (s = [ 'lngRings', 'latRings', ...i ]) : terminal.logic(`expected 'ice', 'icebin', 'gfe' or 'gfebin' but got ${this.format}`);
        var r = [];
        for (let e = 0; e < s.length; e++) r.push(this.getPropertyType(s[e]));
        return {
            propertyNames: s,
            propertyTypes: r
        };
    }
    buildDeclarations() {
        this.declarations.set('xCoord', 'xCoord'), this.declarations.set('yCoord', 'yCoord'), 
        this.declarations.set('xSegment', 'xSegment'), this.declarations.set('ySegment', 'ySegment'), 
        this.declarations.set('xRings', 'xRings'), this.declarations.set('yRings', 'yRings'), 
        this.declarations.set('lngCoord', 'lngCoord'), this.declarations.set('latCoord', 'latCoord'), 
        this.declarations.set('lngSegment', 'lngSegment'), this.declarations.set('latSegment', 'latSegment'), 
        this.declarations.set('lngRings', 'lngRings'), this.declarations.set('latRings', 'latRings');
    }
    getPropertyType(e) {
        return this.declarations.has(e) ? this.declarations.get(e) : 'string';
    }
    isPropertyWanted(e) {
        return !this.propertiesToInclude.includes('none') && (!!this.propertiesToInclude.includes('all') || !!this.propertiesToInclude.includes(e));
    }
    examineHoldingAreaForProperties(e) {
        expect(e, 'String');
        var t = {};
        'Point' == e && this.gcsFeaturePoints.length > 0 ? t = this.gcsFeaturePoints[0].kvPairs : 'Line' == e && this.gcsFeatureLines.length > 0 ? t = this.gcsFeatureLines[0].kvPairs : 'Polygon' == e && this.gcsFeaturePolygons.length > 0 ? t = this.gcsFeaturePolygons[0].kvPairs : terminal.logic(`Unexpected geometry type ${e} (or no features)`);
        var i = [];
        for (let e in t) i.push(e);
        return i;
    }
}