/* Copyright (c) 2022 Read Write Tools. */
import GeojsonParser from '../parsers/geojson-parser.class.js';

import ByteEncodedParser from '../parsers/byte-encoded-parser.class.js';

import StringEncodedParser from '../parsers/string-encoded-parser.class.js';

import GeojsonSerializer from '../serializers/geojson-serializer.class.js';

import ByteEncodedSerializer from '../serializers/byte-encoded-serializer.class.js';

import StringEncodedSerializer from '../serializers/string-encoded-serializer.class.js';

import expect from '../node_modules/softlib/expect.js';

import terminal from '../node_modules/softlib/terminal.js';

export function parseGeojson(e, r, a) {
    return expect(r, 'String'), expect(a, 'Object'), new GeojsonParser(e).parseString(r);
}

export function parseGfe(e, r, a) {
    return expect(r, 'String'), expect(a, 'Object'), new StringEncodedParser(e, 'gfe').parse(r);
}

export function parseIce(e, r, a) {
    return expect(r, 'String'), expect(a, 'Object'), new StringEncodedParser(e, 'ice').parse(r);
}

export function parseTae(e, r, a) {
    return expect(r, 'String'), expect(a, 'Object'), new StringEncodedParser(e, 'tae').parse(r);
}

export function parseGfeBinary(e, r, a) {
    return expect(r, 'ArrayBuffer'), expect(a, 'Object'), new ByteEncodedParser(e, 'gfebin').parse(r);
}

export function parseIceBinary(e, r, a) {
    return expect(r, 'ArrayBuffer'), expect(a, 'Object'), new ByteEncodedParser(e, 'icebin').parse(r);
}

export function parseTaeBinary(e, r, a) {
    return expect(r, 'ArrayBuffer'), expect(a, 'Object'), new ByteEncodedParser(e, 'taebin').parse(r);
}

export function serializeGeojson(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ];
    r.declarations || new Map;
    return new GeojsonSerializer(e, a, t, n).serialize();
}

export function serializeGfe(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new StringEncodedSerializer(e, 'gfe', a, t, n, i).serialize();
}

export function serializeIce(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new StringEncodedSerializer(e, 'ice', a, t, n, i).serialize();
}

export function serializeTae(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new StringEncodedSerializer(e, 'tae', a, t, n, i).serialize();
}

export function serializeGfeBinary(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new ByteEncodedSerializer(e, 'gfebin', a, t, n, i).serialize();
}

export function serializeIceBinary(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new ByteEncodedSerializer(e, 'icebin', a, t, n, i).serialize();
}

export function serializeTaeBinary(e, r) {
    expect(r, 'Object');
    var a = r.accuracy || 3, t = r.datasetId || 'unnamedDataset', n = r.properties || [ 'none' ], i = r.declarations || new Map;
    return new ByteEncodedSerializer(e, 'taebin', a, t, n, i).serialize();
}