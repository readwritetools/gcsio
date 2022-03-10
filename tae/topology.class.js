/* Copyright (c) 2022 Read Write Tools. */
import Coords from '../util/coords.class.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

import { PolygonRing } from '../gcs/gcs-polygon-feature.class.js';

export class Topology {
    constructor() {
        this.inverseCoords = new InverseCoords(this), this.taeCoords = new TaeCoords(this), 
        this.inverseEdges = new InverseEdges(this), this.taeEdges = new TaeEdges(this), 
        this.inverseArcs = new InverseArcs(this), this.taeArcs = new TaeArcs(this), this.initializeForSerialization();
    }
    initializeForSerialization() {
        this.taeCoords.initializeForSerialization(), this.taeEdges.initializeForSerialization(), 
        this.taeArcs.initializeForSerialization();
    }
    buildTopology(e) {
        expect(e, 'Array'), this.buildVertices(e), this.buildMapOfEdges(e), this.buildArcs(e);
    }
    buildVertices(e) {
        expect(e, 'Array');
        for (let t = 0; t < e.length; t++) {
            let r = e[t];
            for (let e = 0; e < r.outerRing.length; e++) this.taeCoords.addVertex(r.outerRing[e]);
            for (let e = 0; e < r.innerRings.length; e++) {
                var s = r.innerRings[e];
                for (let e = 0; e < s.length; e++) this.taeCoords.addVertex(s[e]);
            }
        }
    }
    buildMapOfEdges(e) {
        expect(e, 'Array');
        for (let r = 0; r < e.length; r++) {
            let o = e[r];
            var s = o.kvPairs.name;
            this.buildOneRingsEdges(o.outerRing, 'perimeter', s);
            for (let e = 0; e < o.innerRings.length; e++) {
                var t = o.innerRings[e];
                this.buildOneRingsEdges(t, 'cutout', s);
            }
        }
        this.taeEdges.topologyReductionType1 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType1} approximately duplicate edges disregarded`), 
        this.taeEdges.topologyReductionType2 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType2} double-back duplicate edges disregarded`), 
        this.taeEdges.topologyReductionType3 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType3} triple-edge ownership edges disregarded`);
    }
    buildOneRingsEdges(e, s, t) {
        expect(e, 'PolygonRing'), expect(s, 'String'), expect(t, [ 'String', 'undefined', 'null' ]), 
        e.type = s, e.polygonName = t || '';
        for (let s = 0; s < e.length - 1; s++) {
            let t = e[s], r = e[s + 1], o = this.inverseCoords.get(t.mapKey);
            aver(null != o);
            let i = this.inverseCoords.get(r.mapKey);
            aver(null != i), this.taeEdges.addEdge(o, i, e);
        }
    }
    buildArcs(e) {
        expect(e, 'Array');
        for (let t = 0; t < e.length; t++) {
            let r = e[t];
            this.buildOneRingsArcs(r.outerRing);
            for (let e = 0; e < r.innerRings.length; e++) {
                var s = r.innerRings[e];
                this.buildOneRingsArcs(s);
            }
        }
    }
    buildOneRingsArcs(e) {
        expect(e, 'PolygonRing');
        var s = [];
        if (0 != e.edgeRefs.length) {
            var t = e.edgeRefs[0], r = Math.abs(t), o = this.taeEdges[r];
            t < 0 ? (s.push(o.coordsIndexB), s.push(o.coordsIndexA)) : (s.push(o.coordsIndexA), 
            s.push(o.coordsIndexB));
            for (let a = 1; a < e.edgeRefs.length; a++) {
                var i = e.edgeRefs[a], n = Math.abs(i), d = this.taeEdges[n];
                o.forwardRing === d.forwardRing && o.reverseRing === d.reverseRing && s.length < 255 ? i < 0 ? s.push(d.coordsIndexA) : s.push(d.coordsIndexB) : (this.addArc(e, s), 
                s = [], i < 0 ? (s.push(d.coordsIndexB), s.push(d.coordsIndexA)) : (s.push(d.coordsIndexA), 
                s.push(d.coordsIndexB))), t = i, r = n, o = d;
            }
            this.addArc(e, s);
        }
    }
    addArc(e, s) {
        expect(e, 'PolygonRing'), expect(s, 'Array');
        var t = new Arc;
        for (let e = 0; e < s.length; e++) t.push(s[e]);
        if (null != (o = this.inverseArcs.get(t.reverseMapKey))) {
            var r = -1 * o;
            e.arcRefs.push(r);
        } else {
            var o = this.taeArcs.length;
            this.taeArcs.push(t), this.inverseArcs.set(t.mapKey, o), e.arcRefs.push(o);
        }
    }
}

export class TaeCoords extends Array {
    constructor(e) {
        super(), this.topology = e, this.topologyReductionType4 = 0;
    }
    initializeForSerialization() {
        this.addVertex(new Coords(0, 0));
    }
    addVertex(e) {
        expect(e, 'Coords');
        let s = e.mapKey;
        if (this.topology.inverseCoords.has(s)) return void this.topologyReductionType4++;
        let t = this.length;
        super.push(e), this.topology.inverseCoords.set(s, t);
    }
    push() {
        terminal.logic('TaeCoords: use addVertex(), not push()');
    }
    lngLatFromCoordsIndex(e) {
        return expect(e, 'Number'), aver(1 == Number.isInteger(e)), aver(e >= 0), {
            longitude: this[e].longitude,
            latitude: this[e].latitude
        };
    }
}

export class InverseCoords extends Map {
    constructor(e) {
        super(), this.topology = e;
    }
}

export class TaeEdges extends Array {
    constructor(e) {
        super(), this.topology = e, this.topologyReductionType1 = 0, this.topologyReductionType2 = 0, 
        this.topologyReductionType3 = 0;
    }
    initializeForSerialization() {
        var e = new Edge(0, 0);
        super.push(e);
    }
    addEdge(e, s, t) {
        if (expect(e, 'Number'), expect(s, 'Number'), expect(t, 'PolygonRing'), e != s) {
            var r = new Edge(e, s), o = null;
            if (this.topology.inverseEdges.has(r.reverseMapKey)) {
                if (o = this.topology.inverseEdges.get(r.reverseMapKey), t == (r = this.topology.taeEdges[o]).forwardRing) return void this.topologyReductionType2++;
                if (null != r.reverseRing) return void this.topologyReductionType3++;
                r.setReverseRing(t), t.edgeRefs.push(-1 * o);
            } else r.setForwardRing(t), o = this.length, super.push(r), this.topology.inverseEdges.set(r.forwardMapKey, o), 
            t.edgeRefs.push(o);
        } else this.topologyReductionType1++;
    }
    push() {
        terminal.logic('TaeEdges: use addEdge(), not push()');
    }
}

export class InverseEdges extends Map {
    constructor(e) {
        super(), this.topology = e;
    }
}

export class Edge {
    constructor(e, s) {
        expect(e, 'Number'), expect(s, 'Number'), this.coordsIndexA = e, this.coordsIndexB = s, 
        this.forwardRing = null, this.reverseRing = null;
    }
    get forwardMapKey() {
        return `${this.coordsIndexA}/${this.coordsIndexB}`;
    }
    get reverseMapKey() {
        return `${this.coordsIndexB}/${this.coordsIndexA}`;
    }
    setForwardRing(e) {
        expect(e, 'PolygonRing'), aver(null == this.forwardRing), this.forwardRing = e;
    }
    setReverseRing(e) {
        expect(e, 'PolygonRing'), aver(null == this.reverseRing), this.reverseRing = e;
    }
}

export class EdgeRefs extends Array {
    constructor() {
        super();
    }
}

export class TaeArcs extends Array {
    constructor() {
        super();
    }
    initializeForSerialization() {
        this.push([]);
    }
}

export class Arc extends Array {
    constructor() {
        super();
    }
    get mapKey() {
        return this.join('/');
    }
    get reverseMapKey() {
        return this.getReverseIndexes().join('/');
    }
    getReverseIndexes() {
        var e = this.slice();
        return e.reverse(), e;
    }
}

export class ArcRefs extends Array {
    constructor() {
        super();
    }
}

export class InverseArcs extends Map {
    constructor(e) {
        super(), this.topology = e;
    }
}