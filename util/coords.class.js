/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

export default class Coords {
    constructor(t, e) {
        expect(t, 'Number'), expect(e, 'Number'), this.longitude = Math.fround(t), this.latitude = Math.fround(e), 
        aver(this.longitude >= -180 && this.longitude <= 180), aver(this.latitude >= -90 && this.latitude <= 90);
    }
    get mapKey() {
        return `${this.longitude.toFixed(7)},${this.latitude.toFixed(7)}`;
    }
}