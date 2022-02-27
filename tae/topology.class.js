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
        for (let s = 0; s < e.length; s++) {
            let t = e[s];
            for (let e = 0; e < t.outerRing.length; e++) this.taeCoords.addVertex(t.outerRing[e]);
            for (let e = 0; e < t.innerRings.length; e++) {
                var r = t.innerRings[e];
                for (let e = 0; e < r.length; e++) this.taeCoords.addVertex(r[e]);
            }
        }
        this.taeCoords.topologyErrorType4 > 0 && terminal.trace(`${this.taeCoords.topologyErrorType4} duplicate vertices discarded due to low accuracy`);
    }
    buildMapOfEdges(e) {
        expect(e, 'Array');
        for (let t = 0; t < e.length; t++) {
            let o = e[t];
            var r = o.kvPairs.name;
            this.buildOneRingsEdges(o.outerRing, 'perimeter', r);
            for (let e = 0; e < o.innerRings.length; e++) {
                var s = o.innerRings[e];
                this.buildOneRingsEdges(s, 'cutout', r);
            }
        }
        this.taeEdges.topologyErrorType1 > 0 && terminal.trace(`${this.taeEdges.topologyErrorType1} duplicate coordinates discarded due to low accuracy`), 
        this.taeEdges.topologyErrorType2 > 0 && terminal.trace(`${this.taeEdges.topologyErrorType2} double-back digitizer errors discarded due to low accuracy`), 
        this.taeEdges.topologyErrorType3 > 0 && terminal.trace(`${this.taeEdges.topologyErrorType3} triple-edge ownership discarded due to low accuracy`);
    }
    buildOneRingsEdges(e, r, s) {
        expect(e, 'PolygonRing'), expect(r, 'String'), expect(s, [ 'String', 'undefined' ]), 
        e.type = r, e.polygonName = s || '';
        for (let r = 0; r < e.length - 1; r++) {
            let s = e[r], t = e[r + 1], o = this.inverseCoords.get(s.mapKey);
            aver(null != o);
            let i = this.inverseCoords.get(t.mapKey);
            aver(null != i), this.taeEdges.addEdge(o, i, e);
        }
    }
    buildArcs(e) {
        expect(e, 'Array');
        for (let s = 0; s < e.length; s++) {
            let t = e[s];
            this.buildOneRingsArcs(t.outerRing);
            for (let e = 0; e < t.innerRings.length; e++) {
                var r = t.innerRings[e];
                this.buildOneRingsArcs(r);
            }
        }
    }
    buildOneRingsArcs(e) {
        expect(e, 'PolygonRing');
        var r = [];
        if (0 != e.edgeRefs.length) {
            var s = e.edgeRefs[0], t = Math.abs(s), o = this.taeEdges[t];
            s < 0 ? (r.push(o.coordsIndexB), r.push(o.coordsIndexA)) : (r.push(o.coordsIndexA), 
            r.push(o.coordsIndexB));
            for (let a = 1; a < e.edgeRefs.length; a++) {
                var i = e.edgeRefs[a], n = Math.abs(i), d = this.taeEdges[n];
                o.forwardRing === d.forwardRing && o.reverseRing === d.reverseRing && r.length < 256 ? i < 0 ? r.push(d.coordsIndexA) : r.push(d.coordsIndexB) : (this.addArc(e, r), 
                r = [], i < 0 ? (r.push(d.coordsIndexB), r.push(d.coordsIndexA)) : (r.push(d.coordsIndexA), 
                r.push(d.coordsIndexB))), s = i, t = n, o = d;
            }
            this.addArc(e, r);
        }
    }
    addArc(e, r) {
        expect(e, 'PolygonRing'), expect(r, 'Array');
        var s = new Arc;
        for (let e = 0; e < r.length; e++) s.push(r[e]);
        if (null != (o = this.inverseArcs.get(s.reverseMapKey))) {
            var t = -1 * o;
            e.arcRefs.push(t);
        } else {
            var o = this.taeArcs.length;
            this.taeArcs.push(s), this.inverseArcs.set(s.mapKey, o), e.arcRefs.push(o);
        }
    }
}

export class TaeCoords extends Array {
    constructor(e) {
        super(), this.topology = e, this.topologyErrorType4 = 0;
    }
    initializeForSerialization() {
        this.addVertex(new Coords(0, 0));
    }
    addVertex(e) {
        expect(e, 'Coords');
        let r = e.mapKey;
        if (this.topology.inverseCoords.has(r)) return void this.topologyErrorType4++;
        let s = this.length;
        super.push(e), this.topology.inverseCoords.set(r, s);
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
        super(), this.topology = e, this.topologyErrorType1 = 0, this.topologyErrorType2 = 0, 
        this.topologyErrorType3 = 0;
    }
    initializeForSerialization() {
        var e = new Edge(0, 0);
        super.push(e);
    }
    addEdge(e, r, s) {
        if (expect(e, 'Number'), expect(r, 'Number'), expect(s, 'PolygonRing'), e != r) {
            var t = new Edge(e, r), o = null;
            if (this.topology.inverseEdges.has(t.reverseMapKey)) {
                if (o = this.topology.inverseEdges.get(t.reverseMapKey), s == (t = this.topology.taeEdges[o]).forwardRing) return void this.topologyErrorType2++;
                if (null != t.reverseRing) return void this.topologyErrorType3++;
                t.setReverseRing(s), s.edgeRefs.push(-1 * o);
            } else t.setForwardRing(s), o = this.length, super.push(t), this.topology.inverseEdges.set(t.forwardMapKey, o), 
            s.edgeRefs.push(o);
        } else this.topologyErrorType1++;
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
    constructor(e, r) {
        expect(e, 'Number'), expect(r, 'Number'), this.coordsIndexA = e, this.coordsIndexB = r, 
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