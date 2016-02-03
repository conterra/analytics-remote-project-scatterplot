/*
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dijit/_WidgetBase",
    "dojox/charting/widget/SelectableLegend",
    "ct/_when",
    "usagelog_management_api/_MinSizeMixin"

    ], function(declare, d_lang, d_construct, _WidgetBase, SelectableLegend, ct_when, _MinSizeMixin, undefined){

        return declare([_WidgetBase, _MinSizeMixin],{

            baseClass: "ctChart",
            chartBuilder: undefined,
            chartOptions: undefined,
            store: undefined,
            _legend: undefined,

            /* render */
            buildRendering: function () {
                this.inherited(arguments);
                this._legendNode = d_construct.create("div", {}, this.domNode);
                this._chartNode = d_construct.create("div", {}, this.domNode);
            },

            /* destroy plot, set new store and render plot */
            _setStoreAttr: function (store) {
                this._destroyPlot();
                this._set("store", store);
                var started = this._started;
                if (started) {
                    this._renderPlot()
                }
            },

            uninitialize: function () {
                this._destroyPlot();
                this.inherited(arguments);
            },

            startup: function () {
                var started = this._started;
                this.inherited(arguments);
                if (!started) {
                    this._renderPlot();
                }
            },

            resize: function () {
                this.inherited(arguments);
                if (this._chart) {
                    this._chart.resize();
                }
            },

            _destroyPlot: function () {
                var fetch = this._fetchTask;
                this._fetchTask = undefined;
                if (fetch) {
                    fetch.cancel();
                }
                var plot = this._chart;
                this._chart = null;
                if (plot) {
                    plot.destroy();
                }
            },

            /* render plot */
            _renderPlot: function () {
                var builder = this.chartBuilder;
                if (!builder){
                    return;
                }

                var store = this.store;
                var data = store ? store.query() : [];

                this._fetchTask = ct_when(data, function(data){
                    this._fetchTask = undefined;
                    var plot = this._chart = builder(d_lang.mixin({}, this.chartOptions, {
                        node: this._chartNode,
                        data: data
                    }));
                    plot.render();
                    this._createLegend(plot);

                }, this);
                if (this._chart) {
                    this._fetchTask = undefined;
                }
            },

            _createLegend: function (chart) {
                if (this._legend === undefined) {
                    this._legend = new SelectableLegend({chart: chart, horizontal: false}, this._legendNode);
                } else {
                    this._legend.set("chart", chart);
                    this._legend.refresh();
                }
            }
        });
});