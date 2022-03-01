/* Copyright (c) 2022 Read Write Tools. */
import expect from 'softlib/expect.js';

import aver from 'softlib/aver.js';

import terminal from 'softlib/terminal.js';

export default class EncodedSerializer {
    constructor(e, t, s, i, o, r) {
        expect(e, 'GcsHoldingArea'), expect(t, 'String'), expect(s, 'Number'), expect(i, 'String'), 
        expect(o, 'Array'), expect(r, 'Map'), this.gcsFeaturePoints = e.gcsFeaturePoints, 
        this.gcsFeatureLines = e.gcsFeatureLines, this.gcsFeaturePolygons = e.gcsFeaturePolygons, 
        this.indexedCoordinates = e.indexedCoordinates, this.topology = e.topology, this.format = t, 
        this.accuracy = s, this.datasetId = i, this.propertiesToInclude = o, this.declarations = r, 
        this.debugTopology = !1, this.buildDeclarations();
    }
    serialize() {
        try {
            switch (this.writeProlog(), this.format) {
              case 'ice':
              case 'icebin':
                this.indexedCoordinates.buildPoints(this.gcsFeaturePoints), this.indexedCoordinates.buildLines(this.gcsFeatureLines), 
                this.indexedCoordinates.buildPolygons(this.gcsFeaturePolygons), this.writeMeridiansAndParallels();
                break;

              case 'tae':
              case 'taebin':
                this.gcsFeaturePoints.length > 0 && terminal.abnormal(`TAE and TAEBIN output format are only useful for polygons, ignoring ${this.gcsFeaturePoints.length} points`), 
                this.gcsFeatureLines.length > 0 && terminal.abnormal(`TAE and TAEBIN output format are only useful for polygons, ignoring ${this.gcsFeatureLines.length} lines`), 
                this.topology.buildTopology(this.gcsFeaturePolygons), this.writeCoordinates(), this.writeArcs();
            }
            this.writePointDataset(), this.writeLineDataset(), this.writePolygonDataset();
        } catch (e) {
            return terminal.caught(e), null;
        }
    }
    getPropertyNamesAndTypes(e, t) {
        expect(e, 'Array'), expect(t, 'String');
        var s = [ ...e ];
        s = e.includes('all') ? this.examineHoldingAreaForProperties(t) : e.includes('none') ? [] : [ ...e ];
        var i = [];
        'ice' == this.format || 'icebin' == this.format ? 'Point' == t ? i = [ 'xCoord', 'yCoord', ...s ] : 'Line' == t ? i = [ 'xSegment', 'ySegment', ...s ] : 'Polygon' == t && (i = [ 'xRings', 'yRings', ...s ]) : 'gfe' == this.format || 'gfebin' == this.format ? 'Point' == t ? i = [ 'lngCoord', 'latCoord', ...s ] : 'Line' == t ? i = [ 'lngSegment', 'latSegment', ...s ] : 'Polygon' == t && (i = [ 'lngRings', 'latRings', ...s ]) : 'tae' == this.format || 'taebin' == this.format ? 'Polygon' == t && (i = this.debugTopology ? [ 'edgeRefs', 'edgePairs', 'arcRefs', 'arcCoords', ...s ] : [ 'arcRefs', ...s ]) : terminal.logic(`expected 'gfe' or 'gfebin', 'ice', 'icebin', 'tae' or 'taebin' but got ${this.format}`);
        var o = [];
        for (let e = 0; e < i.length; e++) o.push(this.getPropertyType(i[e]));
        return {
            propertyNames: i,
            propertyTypes: o
        };
    }
    buildDeclarations() {
        this.declarations.set('xCoord', 'xCoord'), this.declarations.set('yCoord', 'yCoord'), 
        this.declarations.set('xSegment', 'xSegment'), this.declarations.set('ySegment', 'ySegment'), 
        this.declarations.set('xRings', 'xRings'), this.declarations.set('yRings', 'yRings'), 
        this.declarations.set('lngCoord', 'lngCoord'), this.declarations.set('latCoord', 'latCoord'), 
        this.declarations.set('lngSegment', 'lngSegment'), this.declarations.set('latSegment', 'latSegment'), 
        this.declarations.set('lngRings', 'lngRings'), this.declarations.set('latRings', 'latRings'), 
        this.debugTopology && (this.declarations.set('edgeRefs', 'edgeRefs'), this.declarations.set('edgePairs', 'edgePairs'), 
        this.declarations.set('arcCoords', 'arcCoords')), this.declarations.set('arcRefs', 'arcRefs');
    }
    getPropertyType(e) {
        return this.declarations.has(e) ? this.declarations.get(e) : 'string';
    }
    isPropertyWanted(e) {
        return !this.propertiesToInclude.includes('none') && (!!this.propertiesToInclude.includes('all') || !!this.propertiesToInclude.includes(e));
    }
    examineHoldingAreaForProperties(e) {
        expect(e, 'String');
        var t = {};
        'Point' == e && this.gcsFeaturePoints.length > 0 ? t = this.gcsFeaturePoints[0].kvPairs : 'Line' == e && this.gcsFeatureLines.length > 0 ? t = this.gcsFeatureLines[0].kvPairs : 'Polygon' == e && this.gcsFeaturePolygons.length > 0 ? t = this.gcsFeaturePolygons[0].kvPairs : terminal.logic(`Unexpected geometry type ${e} (or no features)`);
        var s = [];
        for (let e in t) s.push(e);
        return s;
    }
}