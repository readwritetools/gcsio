/* Copyright (c) 2022 Read Write Tools. */
import Coords from '../util/coords.class.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

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
        for (let r = 0; r < e.length; r++) {
            let t = e[r];
            for (let e = 0; e < t.outerRing.length; e++) this.taeCoords.addVertex(t.outerRing[e]);
            for (let e = 0; e < t.innerRings.length; e++) {
                var s = t.innerRings[e];
                for (let e = 0; e < s.length; e++) this.taeCoords.addVertex(s[e]);
            }
        }
    }
    buildMapOfEdges(e) {
        expect(e, 'Array');
        for (let r = 0; r < e.length; r++) {
            let t = e[r];
            this.buildOneRingsEdges(t.outerRing, 'perimeter', t.kvPairs.name);
            for (let e = 0; e < t.innerRings.length; e++) {
                var s = t.innerRings[e];
                this.buildOneRingsEdges(s, 'cutout', t.kvPairs.name);
            }
        }
    }
    buildOneRingsEdges(e, s, r) {
        expect(e, 'PolygonRing'), expect(s, 'String'), expect(r, 'String'), e.type = s, 
        e.polygonName = r;
        for (let s = 0; s < e.length - 1; s++) {
            let r = e[s], t = e[s + 1], o = this.inverseCoords.get(r.mapKey);
            aver(null != o);
            let i = this.inverseCoords.get(t.mapKey);
            aver(null != i), this.taeEdges.addEdge(o, i, e);
        }
    }
    buildArcs(e) {
        expect(e, 'Array');
        for (let r = 0; r < e.length; r++) {
            let t = e[r];
            this.buildOneRingsArcs(t.outerRing);
            for (let e = 0; e < t.innerRings.length; e++) {
                var s = t.innerRings[e];
                this.buildOneRingsArcs(s);
            }
        }
    }
    buildOneRingsArcs(e) {
        expect(e, 'PolygonRing');
        var s = [], r = e.edgeRefs[0], t = Math.abs(r), o = this.taeEdges[t];
        r < 0 ? (s.push(o.coordsIndexB), s.push(o.coordsIndexA)) : (s.push(o.coordsIndexA), 
        s.push(o.coordsIndexB));
        for (let a = 1; a < e.edgeRefs.length; a++) {
            var i = e.edgeRefs[a], n = Math.abs(i), d = this.taeEdges[n];
            o.forwardRing === d.forwardRing && o.reverseRing === d.reverseRing && s.length < 256 ? i < 0 ? s.push(d.coordsIndexA) : s.push(d.coordsIndexB) : (this.addArc(e, s), 
            s = [], i < 0 ? (s.push(d.coordsIndexB), s.push(d.coordsIndexA)) : (s.push(d.coordsIndexA), 
            s.push(d.coordsIndexB))), r = i, t = n, o = d;
        }
        this.addArc(e, s);
    }
    addArc(e, s) {
        expect(e, 'PolygonRing'), expect(s, 'Array');
        var r = new Arc;
        for (let e = 0; e < s.length; e++) r.push(s[e]);
        if (null != (o = this.inverseArcs.get(r.reverseMapKey))) {
            var t = -1 * o;
            e.arcRefs.push(t);
        } else {
            var o = this.taeArcs.length;
            this.taeArcs.push(r), this.inverseArcs.set(r.mapKey, o), e.arcRefs.push(o);
        }
    }
}

export class TaeCoords extends Array {
    constructor(e) {
        super(), this.topology = e;
    }
    initializeForSerialization() {
        this.addVertex(new Coords(0, 0));
    }
    addVertex(e) {
        expect(e, 'Coords');
        let s = e.mapKey;
        if (this.topology.inverseCoords.has(s)) return;
        let r = this.length;
        super.push(e), this.topology.inverseCoords.set(s, r);
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
        super(), this.topology = e;
    }
    initializeForSerialization() {
        this.addEdge(0, 0, new PolygonRing);
    }
    addEdge(e, s, r) {
        expect(e, 'Number'), expect(s, 'Number'), expect(r, 'PolygonRing');
        var t = new Edge(e, s), o = null;
        this.topology.inverseEdges.has(t.reverseMapKey) ? (o = this.topology.inverseEdges.get(t.reverseMapKey), 
        (t = this.topology.taeEdges[o]).setReverseRing(r), r.edgeRefs.push(-1 * o)) : (t.setForwardRing(r), 
        o = this.length, super.push(t), this.topology.inverseEdges.set(t.forwardMapKey, o), 
        r.edgeRefs.push(o));
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