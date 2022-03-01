/* Copyright (c) 2022 Read Write Tools. */
import fileAPI from './file-api.js';

import userAPI from './user-api.js';

import GcsHoldingArea from './gcs/gcs-holding-area.class.js';

import GcsPointFeature from './gcs/gcs-point-feature.class.js';

import GcsLineFeature from './gcs/gcs-line-feature.class.js';

import GcsPolygonFeature from './gcs/gcs-polygon-feature.class.js';

import Coords from './util/coords.class.js';

export default {
    fileAPI,
    userAPI,
    GcsHoldingArea,
    GcsPointFeature,
    GcsLineFeature,
    GcsPolygonFeature,
    Coords
};