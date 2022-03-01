/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

export default class Coords {
    constructor(t, e) {
        expect(t, 'Number'), expect(e, 'Number'), aver(t >= -180 && t <= 180), aver(e >= -90 && e <= 90), 
        this.longitude = Math.fround(t), this.latitude = Math.fround(e);
    }
    get mapKey() {
        return `${this.longitude.toFixed(7)},${this.latitude.toFixed(7)}`;
    }
}