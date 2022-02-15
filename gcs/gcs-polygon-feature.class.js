/* Copyright (c) 2022 Read Write Tools. */
import GcsBaseFeature from './gcs-base-feature.class.js';

import Coords from './coords.class.js';

import expect from '../node_modules/softlib/expect.js';

export default class GcsPolygonFeature extends GcsBaseFeature {
    constructor() {
        super(), this.outerRing = [], this.innerRings = [];
    }
    closeTheRings() {
        this.closeOneRing(this.outerRing);
        for (let e = 0; e < this.innerRings.length; e++) this.closeOneRing(this.innerRings[e]);
    }
    closeOneRing(e) {
        expect(e, 'Array');
        var s = e.length;
        e[0].longitude == e[s - 1].longitude && e[0].latitude == e[s - 1].latitude || e.push(new Coords(e[0].longitude, e[0].latitude));
    }
}