/* Copyright (c) 2022 Read Write Tools. */
import GcsPointFeature from '../gcs/gcs-point-feature.class.js';

import GcsLineFeature from '../gcs/gcs-line-feature.class.js';

import GcsPolygonFeature from '../gcs/gcs-polygon-feature.class.js';

import Coords from '../gcs/coords.class.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

export default class GeojsonParser {
    constructor(e) {
        expect(e, 'GcsHoldingArea'), this.gcsFeaturePoints = e.gcsFeaturePoints, this.gcsFeatureLines = e.gcsFeatureLines, 
        this.gcsFeaturePolygons = e.gcsFeaturePolygons, Object.seal(this);
    }
    parseString(e) {
        expect(e, 'String');
        var t = JSON.parse(e);
        return this.parseObject(t);
    }
    parseObject(e) {
        expect(e, 'Object');
        try {
            return this.handleAmbiguousJson(e), !0;
        } catch (e) {
            return terminal.caught(e.message), !1;
        }
    }
    handleAmbiguousJson(e) {
        if ('Array' == e.constructor.name) for (let t = 0; t < e.length; t++) this.handleAmbiguousJson(e[t]); else if ('Object' == e.constructor.name) switch (e.type) {
          case 'FeatureCollection':
            return void this.handleFeatureCollection(e);

          case 'Feature':
            return void this.handleFeature(e);

          default:
            terminal.trace(`ignoring geoJSON object type ${geojsonObj.type}`);
        } else terminal.abnormal(`valid RFC 7946 geoJSON objects MUST have a type ${e}`);
    }
    handleFeatureCollection(e) {
        aver('FeatureCollection' == e.type), expect(e.features, 'Array');
        for (let t = 0; t < e.features.length; t++) this.handleAmbiguousJson(e.features[t]);
    }
    handleFeature(e) {
        aver('Feature' == e.type), expect(e.geometry, 'Object'), expect(e.properties, [ 'Object', 'null', 'undefined' ]);
        const t = e.geometry.coordinates;
        expect(t, 'Array');
        const r = e.geometry.type;
        switch (expect(r, 'String'), r) {
          case 'Point':
            this.handlePoint(e.properties, t);
            break;

          case 'MultiPoint':
            for (let r = 0; r < t.length; r++) this.handlePoint(e.properties, t[r]);
            break;

          case 'LineString':
            this.handleLine(e.properties, t);
            break;

          case 'MultiLineString':
            for (let r = 0; r < t.length; r++) this.handleLine(e.properties, t[r]);
            break;

          case 'Polygon':
            this.handlePolygon(e.properties, t);
            break;

          case 'MultiPolygon':
            for (let r = 0; r < t.length; r++) this.handlePolygon(e.properties, t[r]);
            break;

          case 'GeometryCollection':
            terminal.trace('GeometryCollection not supported, try topojson');
            break;

          default:
            terminal.abnormal(`Expected an RFC 7946 geoJSON geometry, but got type ${e.type}`);
        }
    }
    handlePoint(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        const r = this.copyProperties(e), o = new Coords(t[0], t[1]);
        this.createPoint(r, o);
    }
    createPoint(e, t) {
        expect(e, 'Object'), expect(t, 'Coords');
        var r = new GcsPointFeature;
        r.kvPairs = e, r.discretePoint = t, this.gcsFeaturePoints.push(r);
    }
    handleLine(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        const r = this.copyProperties(e), o = [];
        for (let e = 0; e < t.length; e++) {
            const r = t[e];
            o.push(new Coords(r[0], r[1]));
        }
        this.createLine(r, o);
    }
    createLine(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        var r = new GcsLineFeature;
        r.kvPairs = e, r.lineSegment = t, this.gcsFeatureLines.push(r);
    }
    handlePolygon(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        const r = this.copyProperties(e), o = [], s = [];
        for (let e = 0; e < t.length; e++) {
            const r = t[e], a = r.length;
            if (0 == e) {
                for (let e = 0; e < a; e++) o.push(new Coords(r[e][0], r[e][1]));
                aver(o[0].longitude == o[a - 1].longitude), aver(o[0].latitude == o[a - 1].latitude);
            } else {
                var n = [];
                for (let e = 0; e < a; e++) n.push(new Coords(r[e][0], r[e][1]));
                aver(n[0].longitude == n[a - 1].longitude), aver(n[0].latitude == n[a - 1].latitude), 
                s.push(n);
            }
        }
        this.createPolygon(r, o, s);
    }
    createPolygon(e, t, r) {
        expect(e, 'Object'), expect(t, 'Array'), expect(r, 'Array');
        var o = new GcsPolygonFeature;
        o.kvPairs = e, o.outerRing = t, o.innerRings = r, this.gcsFeaturePolygons.push(o);
    }
    copyProperties(e) {
        return expect(e, 'Object'), null == e || null == e ? {} : Object.assign({}, e);
    }
}