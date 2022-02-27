/* Copyright (c) 2022 Read Write Tools. */
import GcsBaseFeature from './gcs-base-feature.class.js';

import Coords from '../util/coords.class.js';

import expect from '../node_modules/softlib/expect.js';

import { ArcRefs } from '../tae/topology.class.js';

import { EdgeRefs } from '../tae/topology.class.js';

export class GcsPolygonFeature extends GcsBaseFeature {
    constructor() {
        super(), this.outerRing = new PolygonRing, this.innerRings = new PolygonCutouts, 
        Object.seal(this);
    }
    closeTheRings() {
        this.closeOneRing(this.outerRing);
        for (let e = 0; e < this.innerRings.length; e++) this.closeOneRing(this.innerRings[e]);
    }
    closeOneRing(e) {
        expect(e, 'PolygonRing');
        var s = e.length;
        0 != s && (e[0].longitude == e[s - 1].longitude && e[0].latitude == e[s - 1].latitude || e.push(new Coords(e[0].longitude, e[0].latitude)));
    }
    get debugName() {
        return this.kvPairs('name');
    }
}

export class PolygonRing extends Array {
    constructor() {
        super(), this.type = '', this.polygonName = '', this.edgeRefs = new EdgeRefs, this.arcRefs = new ArcRefs;
    }
}

export class PolygonCutouts extends Array {
    constructor() {
        super();
    }
}