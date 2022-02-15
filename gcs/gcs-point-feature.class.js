/* Copyright (c) 2022 Read Write Tools. */
import GcsBaseFeature from './gcs-base-feature.class.js';

export default class GcsPointFeature extends GcsBaseFeature {
    constructor() {
        super(), this.discretePoint = null;
    }
}