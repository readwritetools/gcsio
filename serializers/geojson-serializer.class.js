/* Copyright (c) 2022 Read Write Tools. */
import StringBuilder from './builders/string-builder.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class GeojsonSerializer {
    constructor(e, t, r, i) {
        expect(e, 'GcsHoldingArea'), expect(t, 'Number'), expect(r, 'String'), expect(i, 'Array'), 
        this.gcsFeaturePoints = e.gcsFeaturePoints, this.gcsFeatureLines = e.gcsFeatureLines, 
        this.gcsFeaturePolygons = e.gcsFeaturePolygons, this.indexedCoordinates = e.indexedCoordinates, 
        this.accuracy = t, this.datasetId = r, this.propertiesToInclude = i, this.stringBuilder = new StringBuilder;
    }
    serialize() {
        var e = {
            type: 'FeatureCollection',
            id: this.datasetId,
            features: []
        };
        return this.writePointFeatures(e.features), this.writeLineFeatures(e.features), 
        this.writePolygonFeatures(e.features), JSON.stringify(e, null, 4);
    }
    writePointFeatures(e) {
        expect(e, 'Array');
        for (let i = 0; i < this.gcsFeaturePoints.length; i++) {
            var t = this.gcsFeaturePoints[i], r = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: []
                }
            };
            this.writeProperties(r.properties, t), r.geometry.coordinates[0] = this.writeWithAccuracy(t.discretePoint.longitude), 
            r.geometry.coordinates[1] = this.writeWithAccuracy(t.discretePoint.latitude), e.push(r);
        }
    }
    writeLineFeatures(e) {
        expect(e, 'Array');
        for (let s = 0; s < this.gcsFeatureLines.length; s++) {
            var t = this.gcsFeatureLines[s], r = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            };
            this.writeProperties(r.properties, t);
            for (let e = 0; e < t.lineSegment.length; e++) {
                var i = [];
                i[0] = this.writeWithAccuracy(t.lineSegment[e].longitude), i[1] = this.writeWithAccuracy(t.lineSegment[e].latitude), 
                r.geometry.coordinates.push(i);
            }
            e.push(r);
        }
    }
    writePolygonFeatures(e) {
        expect(e, 'Array');
        for (let n = 0; n < this.gcsFeaturePolygons.length; n++) {
            var t = this.gcsFeaturePolygons[n], r = {
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: []
                }
            };
            this.writeProperties(r.properties, t);
            var i = [];
            for (let e = 0; e < t.outerRing.length; e++) {
                (o = [])[0] = this.writeWithAccuracy(t.outerRing[e].longitude), o[1] = this.writeWithAccuracy(t.outerRing[e].latitude), 
                i.push(o);
            }
            r.geometry.coordinates.push(i);
            for (let e = 0; e < t.innerRings.length; e++) {
                var s = [];
                for (let r = 0; r < t.innerRings[e].length; r++) {
                    var o;
                    (o = [])[0] = this.writeWithAccuracy(t.innerRings[e][r].longitude), o[1] = this.writeWithAccuracy(t.innerRings[e][r].latitude), 
                    s.push(o);
                }
                r.geometry.coordinates.push(s);
            }
            e.push(r);
        }
    }
    writeProperties(e, t) {
        expect(e, 'Object'), expect(t, [ 'GcsPointFeature', 'GcsLineFeature', 'GcsPolygonFeature' ]);
        for (let i in t.kvPairs) {
            var r = t.kvPairs[i];
            e[i] = this.writeWithAccuracy(r);
        }
    }
    writeWithAccuracy(e) {
        return null == e ? 'null' : 'Number' != e.constructor.name || Number.isInteger(e) ? e : Number(e.toFixed(this.accuracy));
    }
}