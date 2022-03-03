/* Copyright (c) 2022 Read Write Tools. */
import fs from 'fs';

import { serializeGeojson, serializeGfe, serializeIce, serializeTae, serializeGfeBinary, serializeIceBinary, serializeTaeBinary } from './gcs-serializer.js';

import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

import Pfile from 'iolib/pfile.class.js';

export function writeTextFile(e, i, r) {
    expect(e, 'GcsHoldingArea'), expect(i, 'String'), expect(r, 'Object'), aver([ 'geojson', 'gfe', 'ice', 'tae' ].includes(r.outputFormat));
    try {
        var a = '';
        switch (r.outputFormat) {
          case 'geojson':
            a = serializeGeojson(e, r);
            break;

          case 'gfe':
            a = serializeGfe(e, r);
            break;

          case 'ice':
            a = serializeIce(e, r);
            break;

          case 'tae':
            a = serializeTae(e, r);
            break;

          default:
            a = '';
        }
        return fs.writeFileSync(i, a, 'utf8'), !0;
    } catch (e) {
        return terminal.caught(e), !1;
    }
}

export function writeBinaryFile(e, i, r) {
    expect(e, 'GcsHoldingArea'), expect(i, 'String'), expect(r, 'Object'), aver([ 'gfebin', 'icebin', 'taebin' ].includes(r.outputFormat));
    try {
        var a = null;
        switch (r.outputFormat) {
          case 'gfebin':
            a = serializeGfeBinary(e, r);
            break;

          case 'icebin':
            a = serializeIceBinary(e, r);
            break;

          case 'taebin':
            a = serializeTaeBinary(e, r);
            break;

          default:
            a = null;
        }
        return null != a && (expect(a, 'Uint8Array'), fs.writeFileSync(i, a), !0);
    } catch (e) {
        return terminal.caught(e), !1;
    }
}