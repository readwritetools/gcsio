/* Copyright (c) 2022 Read Write Tools. */
import fs from 'fs';

import { parseGeojson, parseGfe, parseIce, parseTae, parseGfeBinary, parseIceBinary, parseTaeBinary } from './gcs-parser.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

import Pfile from 'iolib/pfile.class.js';

export function readTextFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'geojson', 'gfe', 'ice', 'tae' ].includes(t.inputFormat));
    var a = new Pfile(r);
    if (!a.exists()) return terminal.abnormal(`Text file ${a.name} does not exist`), 
    !1;
    try {
        var i = fs.readFileSync(r, 'utf8');
        switch (t.inputFormat) {
          case 'geojson':
            return parseGeojson(e, i, t);

          case 'gfe':
            return parseGfe(e, i, t);

          case 'ice':
            return parseIce(e, i, t);

          case 'tae':
            return parseTae(e, i, t);

          default:
            return !1;
        }
    } catch (e) {
        return terminal.caught(e), !1;
    }
}

export function readBinaryFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'gfebin', 'icebin', 'taebin' ].includes(t.inputFormat));
    var a = new Pfile(r);
    if (!a.exists()) return terminal.abnormal(`Binary file ${a.name} does not exist`), 
    !1;
    try {
        var i = fs.readFileSync(r), n = new ArrayBuffer(i.length), s = new Uint8Array(n);
        for (let e = 0; e < i.length; e++) s[e] = i[e];
        switch (t.inputFormat) {
          case 'gfebin':
            return parseGfeBinary(e, n, t);

          case 'icebin':
            return parseIceBinary(e, n, t);

          case 'taebin':
            return parseTaeBinary(e, n, t);

          default:
            return !1;
        }
    } catch (e) {
        return terminal.caught(e), !1;
    }
}