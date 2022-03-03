/* Copyright (c) 2022 Read Write Tools. */
import GeojsonSerializer from '../serializers/geojson-serializer.class.js';

import ByteEncodedSerializer from '../serializers/byte-encoded-serializer.class.js';

import StringEncodedSerializer from '../serializers/string-encoded-serializer.class.js';

import expect from 'softlib/expect.js';

export function serializeGeojson(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ];
    a.declarations || new Map;
    return new GeojsonSerializer(e, r, i, t).serialize();
}

export function serializeGfe(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new StringEncodedSerializer(e, 'gfe', r, i, t, n).serialize();
}

export function serializeIce(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new StringEncodedSerializer(e, 'ice', r, i, t, n).serialize();
}

export function serializeTae(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new StringEncodedSerializer(e, 'tae', r, i, t, n).serialize();
}

export function serializeGfeBinary(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new ByteEncodedSerializer(e, 'gfebin', r, i, t, n).serialize();
}

export function serializeIceBinary(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new ByteEncodedSerializer(e, 'icebin', r, i, t, n).serialize();
}

export function serializeTaeBinary(e, a) {
    expect(a, 'Object');
    var r = a.accuracy || 3, i = a.datasetId || 'unnamedDataset', t = a.properties || [ 'all' ], n = a.declarations || new Map;
    return new ByteEncodedSerializer(e, 'taebin', r, i, t, n).serialize();
}