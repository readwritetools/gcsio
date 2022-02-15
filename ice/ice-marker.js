/* Copyright (c) 2022 Read Write Tools. */
export const ICE_PROLOG = [ '!icebin 1.0', '!ice 1.0' ];

export const GFE_PROLOG = [ '!gfebin 1.0', '!gfe 1.0' ];

export const MERIDIANS = [ 31321855, '!meridians' ];

export const PARALLELS = [ 48099071, '!parallels' ];

export const DATASET = [ 64876287, '!dataset' ];

export const GEOMETRY = [ 81653503, '!geometry' ];

export const PROPERTIES = [ 98430719, '!properties' ];

export const FEATURES = [ 115207935, '!features' ];

export const END = [ 131985151, '!end' ];

export function toBin(t) {
    const e = new ArrayBuffer(4);
    new Uint32Array(e)[0] = t[0];
    return new Uint8Array(e);
}

export function toString(t) {
    return t[1];
}