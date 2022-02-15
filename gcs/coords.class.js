/* Copyright (c) 2022 Read Write Tools. */
import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

export default class Coords {
    constructor(e, t) {
        expect(e, 'Number'), expect(t, 'Number'), aver(e >= -180 && e <= 180), aver(t >= -90 && t <= 90), 
        this.longitude = Math.fround(e), this.latitude = Math.fround(t);
    }
}