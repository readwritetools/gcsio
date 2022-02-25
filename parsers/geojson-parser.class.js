/* Copyright (c) 2022 Read Write Tools. */
import GcsPointFeature from '../gcs/gcs-point-feature.class.js';

import GcsLineFeature from '../gcs/gcs-line-feature.class.js';

import { GcsPolygonFeature } from '../gcs/gcs-polygon-feature.class.js';

import { PolygonRing } from '../gcs/gcs-polygon-feature.class.js';

import { PolygonCutouts } from '../gcs/gcs-polygon-feature.class.js';

import Coords from '../util/coords.class.js';

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
            return terminal.caught(e), !1;
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
        const o = e.geometry.type;
        switch (expect(o, 'String'), o) {
          case 'Point':
            this.handlePoint(e.properties, t);
            break;

          case 'MultiPoint':
            for (let o = 0; o < t.length; o++) this.handlePoint(e.properties, t[o]);
            break;

          case 'LineString':
            this.handleLine(e.properties, t);
            break;

          case 'MultiLineString':
            for (let o = 0; o < t.length; o++) this.handleLine(e.properties, t[o]);
            break;

          case 'Polygon':
            this.handlePolygon(e.properties, t);
            break;

          case 'MultiPolygon':
            for (let o = 0; o < t.length; o++) this.handlePolygon(e.properties, t[o]);
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
        const o = this.copyProperties(e), r = new Coords(t[0], t[1]);
        this.createPoint(o, r);
    }
    createPoint(e, t) {
        expect(e, 'Object'), expect(t, 'Coords');
        var o = new GcsPointFeature;
        o.kvPairs = e, o.discretePoint = t, this.gcsFeaturePoints.push(o);
    }
    handleLine(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        const o = this.copyProperties(e), r = [];
        for (let e = 0; e < t.length; e++) {
            const o = t[e];
            r.push(new Coords(o[0], o[1]));
        }
        this.createLine(o, r);
    }
    createLine(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        var o = new GcsLineFeature;
        o.kvPairs = e, o.lineSegment = t, this.gcsFeatureLines.push(o);
    }
    handlePolygon(e, t) {
        expect(e, 'Object'), expect(t, 'Array');
        const o = this.copyProperties(e), r = new PolygonRing, s = new PolygonCutouts;
        for (let e = 0; e < t.length; e++) {
            const o = t[e], a = o.length;
            if (0 == e) {
                for (let e = 0; e < a; e++) r.push(new Coords(o[e][0], o[e][1]));
                aver(r[0].longitude == r[a - 1].longitude), aver(r[0].latitude == r[a - 1].latitude);
            } else {
                var n = new PolygonRing;
                for (let e = 0; e < a; e++) n.push(new Coords(o[e][0], o[e][1]));
                aver(n[0].longitude == n[a - 1].longitude), aver(n[0].latitude == n[a - 1].latitude), 
                s.push(n);
            }
        }
        this.createPolygon(o, r, s);
    }
    createPolygon(e, t, o) {
        expect(e, 'Object'), expect(t, 'PolygonRing'), expect(o, 'PolygonCutouts');
        var r = new GcsPolygonFeature;
        r.kvPairs = e, r.outerRing = t, r.innerRings = o, this.gcsFeaturePolygons.push(r);
    }
    copyProperties(e) {
        return expect(e, 'Object'), null == e || null == e ? {} : Object.assign({}, e);
    }
}