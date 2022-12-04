/* Copyright (c) 2022 Read Write Tools. */
export default function vartype(o){return void 0===o?'undefined':null===o?'null':void 0===o.__proto__?'no prototype':o.constructor.name}