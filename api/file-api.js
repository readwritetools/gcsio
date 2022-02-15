/* Copyright (c) 2022 Read Write Tools. */
import fs from 'fs';

import * as UserAPI from './user-api.js';

import expect from '../node_modules/softlib/expect.js';

import aver from '../node_modules/softlib/aver.js';

import terminal from '../node_modules/softlib/terminal.js';

import Pfile from '../node_modules/iolib/pfile.class.js';

export function readTextFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'geojson', 'ice', 'gfe' ].includes(t.inputFormat));
    var i = new Pfile(r);
    if (!i.exists()) return terminal.abnormal(`Text file ${i.name} does not exist`), 
    !1;
    try {
        var a = fs.readFileSync(r, 'utf8');
        switch (t.inputFormat) {
          case 'geojson':
            return UserAPI.parseGeojson(e, a, t);

          case 'ice':
            return UserAPI.parseIce(e, a, t);

          case 'gfe':
            return UserAPI.parseGfe(e, a, t);

          default:
            return !1;
        }
    } catch (e) {
        return terminal.caught(e.message), !1;
    }
}

export function readBinaryFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'icebin', 'gfebin' ].includes(t.inputFormat));
    var i = new Pfile(r);
    if (!i.exists()) return terminal.abnormal(`Binary file ${i.name} does not exist`), 
    !1;
    try {
        var a = fs.readFileSync(r), n = new ArrayBuffer(a.length), s = new Uint8Array(n);
        for (let e = 0; e < a.length; e++) s[e] = a[e];
        switch (t.inputFormat) {
          case 'icebin':
            return UserAPI.parseIceBinary(e, n, t);

          case 'gfebin':
            return UserAPI.parseGfeBinary(e, n, t);

          default:
            return !1;
        }
    } catch (e) {
        return terminal.caught(e.message), !1;
    }
}

export function writeTextFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'geojson', 'ice', 'gfe' ].includes(t.outputFormat));
    try {
        var i = '';
        switch (t.outputFormat) {
          case 'geojson':
            i = UserAPI.serializeGeojson(e, t);
            break;

          case 'ice':
            i = UserAPI.serializeIce(e, t);
            break;

          case 'gfe':
            i = UserAPI.serializeGfe(e, t);
            break;

          default:
            i = '';
        }
        return fs.writeFileSync(r, i, 'utf8'), !0;
    } catch (e) {
        return terminal.caught(e.message), !1;
    }
}

export function writeBinaryFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'icebin', 'gfebin' ].includes(t.outputFormat));
    try {
        var i = null;
        switch (t.outputFormat) {
          case 'icebin':
            i = UserAPI.serializeIceBinary(e, t);
            break;

          case 'gfebin':
            i = UserAPI.serializeGfeBinary(e, t);
            break;

          default:
            i = null;
        }
        return null != i && (expect(i, 'Uint8Array'), fs.writeFileSync(r, i), !0);
    } catch (e) {
        return terminal.caught(e.message), !1;
    }
}