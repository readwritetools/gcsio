/* Copyright (c) 2022 Read Write Tools. */
import IndexedCoordinates from '../ice/indexed-coordinates.class.js';

import { Topology } from '../tae/topology.class.js';

export default class GcsHoldingArea {
    constructor() {
        this.gcsFeaturePoints = [], this.gcsFeatureLines = [], this.gcsFeaturePolygons = [], 
        this.indexedCoordinates = new IndexedCoordinates, this.topology = new Topology, 
        Object.seal(this);
    }
    reinitialize() {
        this.gcsFeaturePoints = [], this.gcsFeatureLines = [], this.gcsFeaturePolygons = [], 
        this.indexedCoordinates = new IndexedCoordinates, this.topology = new Topology;
    }
    resetIndexedCoordinates() {
        this.indexedCoordinates = new IndexedCoordinates;
    }
    resetTopology() {
        this.topology = new Topology;
    }
}