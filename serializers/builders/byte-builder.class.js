/* Copyright (c) 2022 Read Write Tools. */
import expect from '../../node_modules/softlib/expect.js';

import aver from '../../node_modules/softlib/aver.js';

import terminal from '../../node_modules/softlib/terminal.js';

export default class ByteBuilder extends Array {
    constructor() {
        super();
    }
    push(e) {
        expect(e, 'Uint8Array'), super.push(e);
    }
    get itemCount() {
        return super.length;
    }
    get byteSize() {
        var e = 0;
        for (let r of this) e += r.byteLength;
        return e;
    }
    build() {
        var e = new ArrayBuffer(this.byteSize), r = new Uint8Array(e);
        let t = 0;
        for (let e of this) r.set(e, t), t += e.byteLength;
        return r;
    }
    writeText(e) {
        expect(e, [ 'String', 'null', 'undefined' ]), null != e && null != e || (e = '');
        const r = (new TextEncoder).encode(e);
        this.push(r);
    }
    writeMarker(e) {
        expect(e, 'Uint8Array'), this.push(e);
    }
    writeInt8(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e <= 127), 
        aver(e >= -128);
        var r = new ArrayBuffer(1);
        new DataView(r).setInt8(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeInt16(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e <= 32767), 
        aver(e >= -32768);
        var r = new ArrayBuffer(2);
        new DataView(r).setInt16(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeInt32(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e <= 2147483647), 
        aver(e >= -2147483648);
        var r = new ArrayBuffer(4);
        new DataView(r).setInt32(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeUint8(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e < 256), 
        aver(e >= 0);
        var r = new ArrayBuffer(1);
        new DataView(r).setUint8(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeUint16(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e < 65536), 
        aver(e >= 0);
        var r = new ArrayBuffer(2);
        new DataView(r).setUint16(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeUint32(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e < 4294967296), 
        aver(e >= 0);
        var r = new ArrayBuffer(4);
        new DataView(r).setUint32(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeFloat32(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0);
        var r = new ArrayBuffer(4);
        new DataView(r).setFloat32(0, e, !0);
        var t = new Uint8Array(r);
        this.push(t);
    }
    writeLenPrefixedText(e) {
        if (expect(e, [ 'String', 'Number', 'null', 'undefined' ]), null == e || null == e) return void this.writeUint8(0);
        'Number' == e.constructor.name && (e = e.toString());
        const r = (new TextEncoder).encode(e);
        var t = r.byteLength;
        if (t > 32767) return terminal.abnormal('text longer than 32767 bytes not supported'), 
        void this.writeUint8(0);
        t < 128 ? this.writeUint8(t) : this.writeUint16BigEndian(t + 32768), this.push(r);
    }
    writeUint16BigEndian(e) {
        expect(e, [ 'Number', 'null', 'undefined' ]), isNaN(e) && (e = 0), aver(e < 65536), 
        aver(e >= 0);
        var r = new ArrayBuffer(2);
        new DataView(r).setUint16(0, e, !1);
        var t = new Uint8Array(r);
        this.push(t);
    }
}