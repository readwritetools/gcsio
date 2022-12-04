/* Copyright (c) 2022 Read Write Tools. */
import GeojsonParser from'../parsers/geojson-parser.class.js';import ByteEncodedParser from'../parsers/byte-encoded-parser.class.js';import StringEncodedParser from'../parsers/string-encoded-parser.class.js';import expect from'../softlib/expect.js';export function parseGeojson(e,r,t){return expect(r,'String'),expect(t,'Object'),new GeojsonParser(e).parseString(r)}export function parseGfe(e,r,t){return expect(r,'String'),expect(t,'Object'),new StringEncodedParser(e,'gfe').parse(r)}export function parseIce(e,r,t){return expect(r,'String'),expect(t,'Object'),new StringEncodedParser(e,'ice').parse(r)}export function parseTae(e,r,t){return expect(r,'String'),expect(t,'Object'),new StringEncodedParser(e,'tae').parse(r)}export function parseGfeBinary(e,r,t){return expect(r,'ArrayBuffer'),expect(t,'Object'),new ByteEncodedParser(e,'gfebin').parse(r)}export function parseIceBinary(e,r,t){return expect(r,'ArrayBuffer'),expect(t,'Object'),new ByteEncodedParser(e,'icebin').parse(r)}export function parseTaeBinary(e,r,t){return expect(r,'ArrayBuffer'),expect(t,'Object'),new ByteEncodedParser(e,'taebin').parse(r)}