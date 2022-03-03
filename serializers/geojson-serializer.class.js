/* Copyright (c) 2022 Read Write Tools. */
import StringBuilder from './builders/string-builder.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class GeojsonSerializer {
    constructor(e, t, i, r) {
        expect(e, 'GcsHoldingArea'), expect(t, 'Number'), expect(i, 'String'), expect(r, 'Array'), 
        this.gcsFeaturePoints = e.gcsFeaturePoints, this.gcsFeatureLines = e.gcsFeatureLines, 
        this.gcsFeaturePolygons = e.gcsFeaturePolygons, this.indexedCoordinates = e.indexedCoordinates, 
        this.accuracy = t, this.datasetId = i, this.propertiesToInclude = r, this.stringBuilder = new StringBuilder;
    }
    serialize() {
        var e = null;
        return 1 == this.isMultiFeatureCollection() ? ((e = {
            type: 'MultiFeatureCollection',
            id: this.datasetId,
            collections: []
        }).collections.push(this.pointCollection('points')), e.collections.push(this.lineCollection('lines')), 
        e.collections.push(this.polygonCollection('polygons'))) : this.gcsFeaturePoints.length > 0 ? e = this.pointCollection(this.datasetId) : this.gcsFeatureLines.length ? e = this.lineCollection(this.datasetId) : this.gcsFeaturePolygons.length > 0 && (e = this.polygonCollection(this.datasetId)), 
        JSON.stringify(e, null, 4);
    }
    pointCollection(e) {
        return {
            type: 'FeatureCollection',
            id: e,
            features: this.writePointFeatures()
        };
    }
    lineCollection(e) {
        return {
            type: 'FeatureCollection',
            id: e,
            features: this.writeLineFeatures()
        };
    }
    polygonCollection(e) {
        return {
            type: 'FeatureCollection',
            id: e,
            features: this.writePolygonFeatures()
        };
    }
    isMultiFeatureCollection() {
        var e = 0;
        return this.gcsFeaturePoints.length > 0 && e++, this.gcsFeatureLines.length > 0 && e++, 
        this.gcsFeaturePolygons.length > 0 && e++, e > 1;
    }
    writePointFeatures() {
        var e = [];
        for (let r = 0; r < this.gcsFeaturePoints.length; r++) {
            var t = this.gcsFeaturePoints[r], i = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: []
                }
            };
            this.writeProperties(i.properties, t), i.geometry.coordinates[0] = this.writeWithAccuracy(t.discretePoint.longitude), 
            i.geometry.coordinates[1] = this.writeWithAccuracy(t.discretePoint.latitude), e.push(i);
        }
        return e;
    }
    writeLineFeatures(e) {
        e = [];
        for (let s = 0; s < this.gcsFeatureLines.length; s++) {
            var t = this.gcsFeatureLines[s], i = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            };
            this.writeProperties(i.properties, t);
            for (let e = 0; e < t.lineSegment.length; e++) {
                var r = [];
                r[0] = this.writeWithAccuracy(t.lineSegment[e].longitude), r[1] = this.writeWithAccuracy(t.lineSegment[e].latitude), 
                i.geometry.coordinates.push(r);
            }
            e.push(i);
        }
        return e;
    }
    writePolygonFeatures(e) {
        e = [];
        for (let n = 0; n < this.gcsFeaturePolygons.length; n++) {
            var t = this.gcsFeaturePolygons[n], i = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: []
                }
            };
            this.writeProperties(i.properties, t);
            var r = [];
            for (let e = 0; e < t.outerRing.length; e++) {
                (o = [])[0] = this.writeWithAccuracy(t.outerRing[e].longitude), o[1] = this.writeWithAccuracy(t.outerRing[e].latitude), 
                r.push(o);
            }
            i.geometry.coordinates.push(r);
            for (let e = 0; e < t.innerRings.length; e++) {
                var s = [];
                for (let i = 0; i < t.innerRings[e].length; i++) {
                    var o;
                    (o = [])[0] = this.writeWithAccuracy(t.innerRings[e][i].longitude), o[1] = this.writeWithAccuracy(t.innerRings[e][i].latitude), 
                    s.push(o);
                }
                i.geometry.coordinates.push(s);
            }
            e.push(i);
        }
        return e;
    }
    writeProperties(e, t) {
        expect(e, 'Object'), expect(t, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]);
        for (let r in t.kvPairs) if (this.isPropertyWanted(r)) {
            var i = t.kvPairs[r];
            e[r] = this.writeWithAccuracy(i);
        }
    }
    isPropertyWanted(e) {
        return !this.propertiesToInclude.includes('none') && (!!this.propertiesToInclude.includes('all') || !!this.propertiesToInclude.includes(e));
    }
    writeWithAccuracy(e) {
        return null == e ? 'null' : 'Number' != e.constructor.name || Number.isInteger(e) ? e : Number(e.toFixed(this.accuracy));
    }
}