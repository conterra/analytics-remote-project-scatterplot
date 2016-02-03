/*
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define([
    "dojox/charting/Theme",
    "dojox/charting/themes/common"
], function (Theme, themes) {

    /* REQUIRED: has to the same as in bundle.js "categories" */
    var scatterCategories = 6;
    /* REQUIRED: has to the same as in bundle.js "categories" */

    var generateColorTheme = function () {

        var steps = Math.floor(255/scatterCategories);
        var seriesThemes = [];
        var col;

        for (var i=0; i < scatterCategories; i++) {
            if(i===0){
                col = (scatterCategories * steps).toString(16);
                seriesThemes[i] = {fill: "#"+col+col+col, stroke: "#"+col+col+col};
            }
            else{
                col = ((scatterCategories-i) * steps).toString(16);
                seriesThemes[i] = {fill: "#"+col+col+col, stroke: "#"+col+col+col};
            }
        }
        return seriesThemes;
    };
    var colors = generateColorTheme();

    /* create theme */
    themes.everlastingChartScatterTheme = new Theme({

        chart: {
            fill: "#616165", // background color for chart container
            stroke: {color: "#616165"}, // border arround widgetCOntainer
            pageStyle: {
                color: "#48484b"
            },
            titleFontColor: "white",
            titleFont: "normal normal normal 16px Lato, Helvetica, sans-serif"
        },
        plotarea: {fill: "#616165"},
        axis: {
            stroke: {// the axis itself
                color: "#fff",
                width: 1
            },
            tick: {// used as a foundation for all ticks
                color: "#fff",
                position: "center",
                font: "normal normal normal 7pt Lato, Helvetica, sans-serif", // labels on axis
                fontColor: "#fff" // color of labels
            }
        },
        seriesThemes: colors
        ,
        markerThemes: colors
 });
    return themes.everlastingChartScatterTheme;
});