/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

export default class Coords {
    constructor(t, e) {
        expect(t, 'Number'), expect(e, 'Number'), e > 90 && (e = 90), e < -90 && (e = -90), 
        t > 180 && (t -= 360), t < -180 && (t += 360), this.longitude = Math.fround(t), 
        this.latitude = Math.fround(e);
    }
    get mapKey() {
        return `${this.longitude.toFixed(7)},${this.latitude.toFixed(7)}`;
    }
}