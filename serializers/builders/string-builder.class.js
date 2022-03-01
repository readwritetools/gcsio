/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class StringBuilder extends Array {
    constructor() {
        super();
    }
    push(e) {
        expect(e, 'String'), super.push(e);
    }
    get itemCount() {
        return super.length;
    }
    get utf8Length() {
        var e = 0;
        for (let t of this) e += t.length;
        return e;
    }
    get byteSize() {
        var e = new TextEncoder, t = 0;
        for (let r of this) t += e.encode(r).length;
        return t;
    }
    build() {
        return super.join('');
    }
    putline(e) {
        this.push(e + '\n');
    }
}