/* Copyright (c) 2022 Read Write Tools. */
import fs from 'fs';

import { dirname } from 'path';

import { fileURLToPath } from 'url';

import * as FileAPI from './file-api.js';

import GcsHoldingArea from '../gcs/gcs-holding-area.class.js';

import Pfile from '../node_modules/iolib/pfile.class.js';

import terminal from '../node_modules/softlib/terminal.js';

import expect from '../node_modules/softlib/expect.js';

export default class CLI {
    constructor() {
        this.inputFile = '', this.outputFile = '', this.inputFormat = '', this.outputFormat = '', 
        this.accuracy = 3, this.datasetId = 'unnamedDataset', this.properties = 'none', 
        this.declarationsFile = '', this.gcsHoldingArea = new GcsHoldingArea, Object.seal(this);
    }
    validateOptions() {
        var t = Array.from(process.argv);
        2 == t.length && this.usageAndExit('');
        for (let e = t.length - 1; e > 1; e--) {
            var i = t[e];
            switch (i) {
              case '--version':
                return this.exit(this.showVersion()), !1;

              case '--help':
                return this.usageAndExit(''), !1;
            }
            0 == i.indexOf('--input') ? (this.inputFile = new Pfile(i.substr(8)), t.splice(e, 1)) : 0 == i.indexOf('--output') ? (this.outputFile = new Pfile(i.substr(9)), 
            t.splice(e, 1)) : 0 == i.indexOf('--iformat') ? (this.inputFormat = i.substr(10), 
            t.splice(e, 1)) : 0 == i.indexOf('--oformat') ? (this.outputFormat = i.substr(10), 
            t.splice(e, 1)) : 0 == i.indexOf('--accuracy') ? (this.accuracy = parseInt(i.substr(11)), 
            t.splice(e, 1)) : 0 == i.indexOf('--dataset-id') ? (this.datasetId = i.substr(13), 
            t.splice(e, 1)) : 0 == i.indexOf('--properties') ? (this.properties = i.substr(13), 
            t.splice(e, 1)) : 0 == i.indexOf('--declarations') && (this.declarationsFile = new Pfile(i.substr(15)), 
            t.splice(e, 1));
        }
        t.length > 3 && this.usageAndExit(`Don't know how to handle "${t[3]}"`), null != this.inputFile && '' != this.inputFile || this.usageAndExit('Specify an input file'), 
        0 == this.inputFile.exists() && this.usageAndExit(`Input file does not exist "${this.inputFile.name}"`), 
        this.inputFile.isDirectory() && this.usageAndExit('Specify an input file, not a directory'), 
        null != this.outputFile && '' != this.outputFile || this.usageAndExit('Specify an output file'), 
        this.outputFile.isDirectory() && this.usageAndExit('Specify an output file, not a directory');
        var e = new Pfile(this.outputFile.getPath());
        e.exists() || this.usageAndExit(`Output directory does not exist "${e.name}"`), 
        '' == this.inputFormat && (this.inputFormat = this.inputFile.getExtension()), '' == this.outputFormat && (this.outputFormat = this.outputFile.getExtension());
        const s = [ 'geojson', 'gfe', 'gfebin', 'ice', 'icebin', 'tae', 'taebin' ];
        s.includes(this.inputFormat) || this.usageAndExit(`--iformat option expected ${JSON.stringify(s)} but got ${this.inputFormat}`), 
        s.includes(this.outputFormat) || this.usageAndExit(`--oformat option expected ${JSON.stringify(s)} but got ${this.outputFormat}`), 
        (this.accuracy < 1 || this.accuracy > 6) && this.usageAndExit(`--accuracy option expected 1 to 6 (1=11km, 2=1100m, 3=110m, 4=11m, 5=1.1m, 6=11cm) but got ${this.accuracy}`);
        var o = this.properties.split(',');
        return 0 == this.properties.length && this.usageAndExit(`--properties option should specify a comma-separated list of names from this list: ${JSON.stringify(validProperties)}`), 
        this.properties = o, null != this.declarationsFile && '' != this.declarationsFile && (0 == this.declarationsFile.exists() && this.usageAndExit(`The declarations file does not exist "${this.declarationsFile.makeAbsolute().name}"`), 
        this.declarationsFile.isDirectory() && this.usageAndExit('Specify an declarations file, not a directory')), 
        !0;
    }
    usageAndExit(t) {
        var i = [];
        i.push(''), i.push('GCSCIO | Geographic Coordinate System I/O: reading from and writing to files with longitude/latitude coordinates'), 
        i.push('usage: gcscio --input=filename --output=filename [options]'), i.push(''), 
        i.push('options:'), i.push('    --input=      filename to read from'), i.push('    --output=     filename to write to'), 
        i.push('    --iformat=    input file format, optionally defaults to filename extension'), 
        i.push('    --oformat=    output file format, optionally defaults to filename extension'), 
        i.push('                    \'geojson\' RFC 7946'), i.push('                    \'gfe\'     Geographic Feature Encoding'), 
        i.push('                    \'gfebin\'  Geographic Feature Encoding binary'), i.push('                    \'ice\'     Indexed Coordinate Encoding'), 
        i.push('                    \'icebin\'  Indexed Coordinate Encoding binary'), i.push('                    \'tae\'     Topological Arc Encoding'), 
        i.push('                    \'taebin\'  Topological Arc Encoding binary'), i.push('    --accuracy=   digits to use for latitude and longitude coordinates 1 to 6 (1=11km, 2=1100m, 3=110m, 4=11m, 5=1.1m, 6=11cm)'), 
        i.push('    --dataset-id= identifier for the collection of points, lines or polygons'), 
        i.push('    --properties  which properties to include with each feature'), i.push('                    a comma-separated list of property names, or the keyword \'none\' or \'all\''), 
        i.push('    --declarations  the name of a file which contains declarations of property names and property types'), 
        i.push('                    where each line is in the form "name=type"'), i.push('                    Valid types are:'), 
        i.push('                      string, string[],'), i.push('                      tinyint, tinyuint, tinyint[], tinyuint[]'), 
        i.push('                      shortint, shortuint, shortint[], shortuint[]'), i.push('                      longint, longuint, longint[], longuint[]'), 
        i.push('                      float, float[]'), i.push('                      json'), 
        i.push('    --version'), i.push('    --help'), i.push(''), i.push('† default'), 
        i.push(''), i.push(t), i.push(''), terminal.writeToConsoleOrStderr(i.join('\n')), 
        process.exit(1);
    }
    showVersion() {
        try {
            const e = dirname(fileURLToPath(import.meta.url));
            var t = new Pfile(e).addPath('../package.json').name, i = fs.readFileSync(t, 'utf-8');
            return `version v${JSON.parse(i).version}`;
        } catch (t) {
            return `version unknown ${t.message}`;
        }
    }
    exit(t) {
        terminal.writeToConsoleOrStderr('\nSCIO | Spherical coordinates I/O: reading from and writing to files with longitude/latitude coordinates\n'), 
        terminal.writeToConsoleOrStderr(t + '\n'), process.exit(0);
    }
    buildDeclarations() {
        var t = new Map;
        if (null == this.declarationsFile || '' == this.declarationsFile) return t;
        if (expect(this.declarationsFile, 'Pfile'), 0 == this.declarationsFile.exists()) return t;
        try {
            var i = fs.readFileSync(this.declarationsFile.name, 'utf8').split('\n');
            for (let n = 0; n < i.length; n++) {
                var e = i[n].trim();
                if (0 != e.length && 0 != e.indexOf('//') && 0 != e.indexOf('#')) {
                    var [s, o] = e.split('=');
                    t.set(s.trim(), o.trim());
                }
            }
        } catch (t) {
            terminal.caught(t);
        }
        return t;
    }
    execute() {
        var t = {
            inputFormat: this.inputFormat,
            outputFormat: this.outputFormat,
            accuracy: this.accuracy,
            datasetId: this.datasetId,
            properties: this.properties,
            declarations: this.buildDeclarations()
        }, i = !1;
        switch (this.inputFormat) {
          case 'geojson':
          case 'gfe':
          case 'ice':
          case 'tae':
            i = FileAPI.readTextFile(this.gcsHoldingArea, this.inputFile.name, t);
            break;

          case 'gfebin':
          case 'icebin':
          case 'taebin':
            i = FileAPI.readBinaryFile(this.gcsHoldingArea, this.inputFile.name, t);
        }
        switch (i || process.exit(1), this.outputFormat) {
          case 'geojson':
          case 'gfe':
          case 'ice':
          case 'tae':
            i = FileAPI.writeTextFile(this.gcsHoldingArea, this.outputFile.name, t);
            break;

          case 'gfebin':
          case 'icebin':
          case 'taebin':
            i = FileAPI.writeBinaryFile(this.gcsHoldingArea, this.outputFile.name, t);
        }
        i ? process.exit(0) : process.exit(1);
    }
}