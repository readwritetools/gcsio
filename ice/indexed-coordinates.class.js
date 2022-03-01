/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class IndexedCoordinates {
    constructor() {
        this.meridians = new Array, this.parallels = new Array, this.inverseMeridians = new Map, 
        this.inverseParallels = new Map;
    }
    buildPoints(e) {
        expect(e, 'Array');
        for (let t of e) this.registerLongitude(t.discretePoint.longitude), this.registerLatitude(t.discretePoint.latitude);
    }
    buildLines(e) {
        expect(e, 'Array');
        for (let t of e) for (let e = 0; e < t.lineSegment.length; e++) this.registerLongitude(t.lineSegment[e].longitude), 
        this.registerLatitude(t.lineSegment[e].latitude);
    }
    buildPolygons(e) {
        expect(e, 'Array');
        for (let r of e) {
            for (let e = 0; e < r.outerRing.length; e++) this.registerLongitude(r.outerRing[e].longitude), 
            this.registerLatitude(r.outerRing[e].latitude);
            for (let e = 0; e < r.innerRings.length; e++) {
                var t = r.innerRings[e];
                for (let e = 0; e < t.length; e++) this.registerLongitude(t[e].longitude), this.registerLatitude(t[e].latitude);
            }
        }
    }
    get packedWidth() {
        return this.meridians.length > 65536 || this.parallels.length > 65536 ? 4 : 2;
    }
    registerCoordinates(e, t) {
        return [ this.registerLongitude(e), this.registerLatitude(t) ];
    }
    registerLongitude(e) {
        expect(e, 'Number'), aver(e >= -180 && e <= 180);
        e = Math.fround(e);
        var t = this.inverseMeridians.get(e);
        if (null == t) {
            t = this.meridians.push(e) - 1, this.inverseMeridians.set(e, t);
        }
        return t;
    }
    registerLatitude(e) {
        expect(e, 'Number'), aver(e >= -90 && e <= 90);
        e = Math.fround(e);
        var t = this.inverseParallels.get(e);
        if (null == t) {
            t = this.parallels.push(e) - 1, this.inverseParallels.set(e, t);
        }
        return t;
    }
    getLongitude(e) {
        return e < 0 || e >= this.meridians.length ? null : this.meridians[e];
    }
    getLatitude(e) {
        return e < 0 || e >= this.parallels.length ? null : this.parallels[e];
    }
    getIceX(e) {
        e = Math.fround(e);
        return this.inverseMeridians.get(e);
    }
    getIceY(e) {
        e = Math.fround(e);
        return this.inverseParallels.get(e);
    }
    uidFromIce(e, t) {
        return expect(e, 'Number'), expect(t, 'Number'), aver(e >= 0 && e < this.meridians.length), 
        aver(t >= 0 && t < this.parallels.length), `${e}×${t}`;
    }
}