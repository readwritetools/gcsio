/* Copyright (c) 2022 Read Write Tools. */
import GcsBaseFeature from './gcs-base-feature.class.js';

export default class GcsLineFeature extends GcsBaseFeature {
    constructor() {
        super(), this.lineSegment = [], Object.seal(this);
    }
}