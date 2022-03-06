/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class IndexedCoordinates {
    constructor() {
        this.meridians = new Array, this.parallels = new Array, this.inverseMeridians = new Map, 
        this.inverseParallels = new Map;
    }
    get packedWidth() {
        return this.meridians.length > 65536 || this.parallels.length > 65536 ? 4 : 2;
    }
    registerLongitude(e) {
        expect(e, 'Number'), aver(e >= -180 && e <= 180);
        e = Math.fround(e);
        var r = this.inverseMeridians.get(e);
        if (null == r) {
            r = this.meridians.push(e) - 1, this.inverseMeridians.set(e, r);
        }
        return r;
    }
    registerLatitude(e) {
        expect(e, 'Number'), aver(e >= -90 && e <= 90);
        e = Math.fround(e);
        var r = this.inverseParallels.get(e);
        if (null == r) {
            r = this.parallels.push(e) - 1, this.inverseParallels.set(e, r);
        }
        return r;
    }
    addLongitude(e) {
        expect(e, 'Number'), aver(e >= -180 && e <= 180), this.meridians.push(e);
    }
    addLatitude(e) {
        expect(e, 'Number'), aver(e >= -90 && e <= 90), this.parallels.push(e);
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
    uidFromIce(e, r) {
        return expect(e, 'Number'), expect(r, 'Number'), aver(e >= 0 && e < this.meridians.length), 
        aver(r >= 0 && r < this.parallels.length), `${e}×${r}`;
    }
}