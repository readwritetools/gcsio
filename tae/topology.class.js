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
        for (let s = 0; s < e.length; s++) {
            let r = e[s];
            for (let e = 0; e < r.outerRing.length; e++) this.taeCoords.addVertex(r.outerRing[e]);
            for (let e = 0; e < r.innerRings.length; e++) {
                var t = r.innerRings[e];
                for (let e = 0; e < t.length; e++) this.taeCoords.addVertex(t[e]);
            }
        }
        this.taeCoords.topologyReductionType4 > 0 && terminal.trace(`Topology coordinate master reduced by ${this.taeCoords.topologyReductionType4} vertices.`);
    }
    buildMapOfEdges(e) {
        expect(e, 'Array');
        for (let r = 0; r < e.length; r++) {
            let o = e[r];
            var t = o.kvPairs.name;
            this.buildOneRingsEdges(o.outerRing, 'perimeter', t);
            for (let e = 0; e < o.innerRings.length; e++) {
                var s = o.innerRings[e];
                this.buildOneRingsEdges(s, 'cutout', t);
            }
        }
        this.taeEdges.topologyReductionType1 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType1} approximately duplicate edges disregarded`), 
        this.taeEdges.topologyReductionType2 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType2} double-back duplicate edges disregarded`), 
        this.taeEdges.topologyReductionType3 > 0 && terminal.trace(`${this.taeEdges.topologyReductionType3} triple-edge ownership edges disregarded`);
    }
    buildOneRingsEdges(e, t, s) {
        expect(e, 'PolygonRing'), expect(t, 'String'), expect(s, [ 'String', 'undefined' ]), 
        e.type = t, e.polygonName = s || '';
        for (let t = 0; t < e.length - 1; t++) {
            let s = e[t], r = e[t + 1], o = this.inverseCoords.get(s.mapKey);
            aver(null != o);
            let i = this.inverseCoords.get(r.mapKey);
            aver(null != i), this.taeEdges.addEdge(o, i, e);
        }
    }
    buildArcs(e) {
        expect(e, 'Array');
        for (let s = 0; s < e.length; s++) {
            let r = e[s];
            this.buildOneRingsArcs(r.outerRing);
            for (let e = 0; e < r.innerRings.length; e++) {
                var t = r.innerRings[e];
                this.buildOneRingsArcs(t);
            }
        }
    }
    buildOneRingsArcs(e) {
        expect(e, 'PolygonRing');
        var t = [];
        if (0 != e.edgeRefs.length) {
            var s = e.edgeRefs[0], r = Math.abs(s), o = this.taeEdges[r];
            s < 0 ? (t.push(o.coordsIndexB), t.push(o.coordsIndexA)) : (t.push(o.coordsIndexA), 
            t.push(o.coordsIndexB));
            for (let a = 1; a < e.edgeRefs.length; a++) {
                var i = e.edgeRefs[a], n = Math.abs(i), d = this.taeEdges[n];
                o.forwardRing === d.forwardRing && o.reverseRing === d.reverseRing && t.length < 255 ? i < 0 ? t.push(d.coordsIndexA) : t.push(d.coordsIndexB) : (this.addArc(e, t), 
                t = [], i < 0 ? (t.push(d.coordsIndexB), t.push(d.coordsIndexA)) : (t.push(d.coordsIndexA), 
                t.push(d.coordsIndexB))), s = i, r = n, o = d;
            }
            this.addArc(e, t);
        }
    }
    addArc(e, t) {
        expect(e, 'PolygonRing'), expect(t, 'Array');
        var s = new Arc;
        for (let e = 0; e < t.length; e++) s.push(t[e]);
        if (null != (o = this.inverseArcs.get(s.reverseMapKey))) {
            var r = -1 * o;
            e.arcRefs.push(r);
        } else {
            var o = this.taeArcs.length;
            this.taeArcs.push(s), this.inverseArcs.set(s.mapKey, o), e.arcRefs.push(o);
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
        let t = e.mapKey;
        if (this.topology.inverseCoords.has(t)) return void this.topologyReductionType4++;
        let s = this.length;
        super.push(e), this.topology.inverseCoords.set(t, s);
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
    addEdge(e, t, s) {
        if (expect(e, 'Number'), expect(t, 'Number'), expect(s, 'PolygonRing'), e != t) {
            var r = new Edge(e, t), o = null;
            if (this.topology.inverseEdges.has(r.reverseMapKey)) {
                if (o = this.topology.inverseEdges.get(r.reverseMapKey), s == (r = this.topology.taeEdges[o]).forwardRing) return void this.topologyReductionType2++;
                if (null != r.reverseRing) return void this.topologyReductionType3++;
                r.setReverseRing(s), s.edgeRefs.push(-1 * o);
            } else r.setForwardRing(s), o = this.length, super.push(r), this.topology.inverseEdges.set(r.forwardMapKey, o), 
            s.edgeRefs.push(o);
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
    constructor(e, t) {
        expect(e, 'Number'), expect(t, 'Number'), this.coordsIndexA = e, this.coordsIndexB = t, 
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