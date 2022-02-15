/* Copyright (c) 2022 Read Write Tools. */
import IndexedCoordinates from '../ice/indexed-coordinates.js';

export default class GcsHoldingArea {
    constructor() {
        this.gcsFeaturePoints = [], this.gcsFeatureLines = [], this.gcsFeaturePolygons = [], 
        this.indexedCoordinates = new IndexedCoordinates;
    }
    reinitialize() {
        this.gcsFeaturePoints = [], this.gcsFeatureLines = [], this.gcsFeaturePolygons = [], 
        this.indexedCoordinates = new IndexedCoordinates;
    }
    resetIndexedCoordinates() {
        this.indexedCoordinates = new IndexedCoordinates;
    }
}