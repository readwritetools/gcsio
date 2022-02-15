/* Copyright (c) 2022 Read Write Tools. */
import GeojsonParser from '../parsers/geojson-parser.class.js';

import ByteEncodedParser from '../parsers/byte-encoded-parser.class.js';

import StringEncodedParser from '../parsers/string-encoded-parser.class.js';

import GeojsonSerializer from '../serializers/geojson-serializer.class.js';

import ByteEncodedSerializer from '../serializers/byte-encoded-serializer.class.js';

import StringEncodedSerializer from '../serializers/string-encoded-serializer.class.js';

import expect from '../node_modules/softlib/expect.js';

import terminal from '../node_modules/softlib/terminal.js';

export function parseGeojson(e, r, t) {
    return expect(r, 'String'), expect(t, 'Object'), new GeojsonParser(e).parseString(r);
}

export function parseIce(e, r, t) {
    return expect(r, 'String'), expect(t, 'Object'), new StringEncodedParser(e, 'ice').parse(r);
}

export function parseGfe(e, r, t) {
    return expect(r, 'String'), expect(t, 'Object'), new StringEncodedParser(e, 'gfe').parse(r);
}

export function parseIceBinary(e, r, t) {
    return expect(r, 'ArrayBuffer'), expect(t, 'Object'), new ByteEncodedParser(e, 'icebin').parse(r);
}

export function parseGfeBinary(e, r, t) {
    return expect(r, 'ArrayBuffer'), expect(t, 'Object'), new ByteEncodedParser(e, 'gfebin').parse(r);
}

export function serializeGeojson(e, r) {
    expect(r, 'Object');
    var t = r.accuracy || 3, n = r.datasetId || 'unnamedDataset', a = r.properties || [ 'none' ];
    r.declarations || new Map;
    return new GeojsonSerializer(e, t, n, a).serialize();
}

export function serializeIce(e, r) {
    expect(r, 'Object');
    var t = r.accuracy || 3, n = r.datasetId || 'unnamedDataset', a = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new StringEncodedSerializer(e, 'ice', t, n, a, i).serialize();
}

export function serializeGfe(e, r) {
    expect(r, 'Object');
    var t = r.accuracy || 3, n = r.datasetId || 'unnamedDataset', a = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new StringEncodedSerializer(e, 'gfe', t, n, a, i).serialize();
}

export function serializeIceBinary(e, r) {
    expect(r, 'Object');
    var t = r.accuracy || 3, n = r.datasetId || 'unnamedDataset', a = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new ByteEncodedSerializer(e, 'icebin', t, n, a, i).serialize();
}

export function serializeGfeBinary(e, r) {
    expect(r, 'Object');
    var t = r.accuracy || 3, n = r.datasetId || 'unnamedDataset', a = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new ByteEncodedSerializer(e, 'gfebin', t, n, a, i).serialize();
}