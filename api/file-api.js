/* Copyright (c) 2022 Read Write Tools. */
import fs from 'fs';

import * as UserAPI from './user-api.js';

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
            return UserAPI.parseGeojson(e, i, t);

          case 'gfe':
            return UserAPI.parseGfe(e, i, t);

          case 'ice':
            return UserAPI.parseIce(e, i, t);

          case 'tae':
            return UserAPI.parseTae(e, i, t);

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
            return UserAPI.parseGfeBinary(e, n, t);

          case 'icebin':
            return UserAPI.parseIceBinary(e, n, t);

          case 'taebin':
            return UserAPI.parseTaeBinary(e, n, t);

          default:
            return !1;
        }
    } catch (e) {
        return terminal.caught(e), !1;
    }
}

export function writeTextFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'geojson', 'gfe', 'ice', 'tae' ].includes(t.outputFormat));
    try {
        var a = '';
        switch (t.outputFormat) {
          case 'geojson':
            a = UserAPI.serializeGeojson(e, t);
            break;

          case 'gfe':
            a = UserAPI.serializeGfe(e, t);
            break;

          case 'ice':
            a = UserAPI.serializeIce(e, t);
            break;

          case 'tae':
            a = UserAPI.serializeTae(e, t);
            break;

          default:
            a = '';
        }
        return fs.writeFileSync(r, a, 'utf8'), !0;
    } catch (e) {
        return terminal.caught(e), !1;
    }
}

export function writeBinaryFile(e, r, t) {
    expect(e, 'GcsHoldingArea'), expect(r, 'String'), expect(t, 'Object'), aver([ 'gfebin', 'icebin', 'taebin' ].includes(t.outputFormat));
    try {
        var a = null;
        switch (t.outputFormat) {
          case 'gfebin':
            a = UserAPI.serializeGfeBinary(e, t);
            break;

          case 'icebin':
            a = UserAPI.serializeIceBinary(e, t);
            break;

          case 'taebin':
            a = UserAPI.serializeTaeBinary(e, t);
            break;

          default:
            a = null;
        }
        return null != a && (expect(a, 'Uint8Array'), fs.writeFileSync(r, a), !0);
    } catch (e) {
        return terminal.caught(e), !1;
    }
}