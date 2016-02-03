/*
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define([
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojox/charting/Chart",
    "./chartingThemes/everlastingChartScatterTheme",
    "dojox/charting/plot2d/Scatter"

], function (d_array, d_lang, Chart, theme, Scatter) {

    /* push query data into data_array */
    var prepareSeriesData = function (data, valueWidth, valueHeight) {
        return d_array.map(data, function(item) {
            var width = item[valueWidth];
            var height = item[valueHeight];
            return {x: width  , y: height};
        });
    };

    /* compare 2 objects, returns true/false */
    var equals = function(obj1, obj2) {
        return obj1.x === obj2.x && obj1.y === obj2.y;
    };

    /* count duplicates */
    var countDuplicates = function(data,iCat){
        var counter = 0;
            for (var i = 0; i < data.length; i++) {
                if (equals(data[iCat], data[i]) === true) {
                    counter++;
                }
            }
        return counter;
    };

    /* get highest duplicate value */
    var getHighestDuplicate = function(data){
        var highestCount = 0;
        var counter = 0;
        for (var iDup = 0; iDup < data.length; iDup++) {
            for(var jDup = 0; jDup < data.length; jDup++) {
                if (equals(data[iDup], data[jDup]) === true) {
                    counter++;
                    if (counter >= highestCount) {
                        highestCount = counter;
                    }
                }
            }
            counter = 0;
        }
        return highestCount;
    };

    return function (options){

        var cat_array = [];
        var cat_indices = {};

        var scatterCategories = options.categories;

        var plot = new Chart(options.node,{
            title: options.title
        });
        plot.addPlot("default", {
            type: Scatter
        });

        var data = prepareSeriesData(options.data, options.valueWidth || "viewport.width" , options.valueHeight || "viewport.height");

        /* getMaxValues x,y */
        var max_x = Math.max.apply(Math,data.map(function(o){return o.x;}));
        var max_y = Math.max.apply(Math,data.map(function(o){return o.y;}));

        /* highest duplicate */
        var highest = getHighestDuplicate(data);

        /* category cut */
        var cut = highest / scatterCategories;

        // empty arrays, indices for categories
        for (var iArray = 0; iArray < scatterCategories; iArray++){
            cat_array[iArray] = [];
            cat_indices[iArray] = 0;
        }

        /* order data in arrays inside cat_array  */
        for (var iCat = 0; iCat < data.length; iCat++) {

            var counter = countDuplicates(data, iCat);
            var factor = highest;
            for(var i = 0; i < scatterCategories; i++){

                if (counter >= factor-cut) {
                    cat_array[i][cat_indices[i]] = data[iCat];
                    cat_indices[i]++;
                    break;
                }
                else {
                    factor = factor-cut;
                }
            }
            counter = 0;
        }

        /* axis config */
        plot.addAxis("x", {
            natural: true,
            title: options.xname,
            titleOrientation: "away",
            titleFontColor: "#fff",
            min: 0,
            max: max_x+50,
            majorTickStep: 500,
            minorTickStep: 250
        });
        plot.addAxis("y", {
            vertical: true,
            title: options.yname,
            titleFontColor: "#fff",
            fixLower: "major",
            fixUpper: "major",
            min: 0,
            max: max_y+50,
            majorTickStep: 500,
            minorTickStep: 250
        });

        /* theme */
        plot.setTheme(options.theme || theme);

        var range = 0;
        var prevRange = 0;
        /* add series from cat_array to the chart */
        function getLabel() {
            if(points === 0 ) return options.noValues;
            if (prevRange === 0) return  " > " + range+ " "+ options.frequency;
            else return range + " - " + (prevRange-1)+ " "+options.frequency ;
        }

        for (var iSeries = 0; iSeries < scatterCategories; iSeries++){

            range = Math.floor(highest - ((iSeries+1)*cut));

            var points;
            /* chooses one of the markers in the array randomly, avoid using cross or X symbols */
            var markerArray = ["m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", "m-3,-3 l0,6 6,0 0,-6 z", "m0,-3 l3,3 -3,3 -3,-3 z", "m-3,3 l3,-6 3,6 z", "m-3,-3 l3,6 3,-6 z"];
            var randomMarker = markerArray[Math.floor(Math.random() * markerArray.length)];

            /* counts number of points in cat arrays, needed for category labeling */
            if(cat_array[iSeries].length !== undefined){
                points = cat_array[iSeries].length;
            }
            else {
                points = 0;
            }

            /* alternative: only forward non0 arrays, colorthemes do not work as intended anymore */
            /*
            if(cat_array[iSeries] === undefined || cat_array[iSeries].length == 0){

            }
            else{
                plot.addSeries(" freq. >= "+range + " / points: "+ points, cat_array[iSeries]);
            }
            */
            plot.addSeries(getLabel(), cat_array[iSeries], {marker: randomMarker});
            prevRange = range;
        }
        return plot;
    };
});