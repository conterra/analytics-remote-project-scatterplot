/*
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define ([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "ct/_when",
    "dijit/form/Button",
    "usagelog_management_api/WidgetContainer",
    "usagelog_management_api/Repeater",
    "./ScatterBuilder",
    "./ScatterWidget",
    "./ItemQueryExecutor"
], function (declare, d_lang, d_on, ct_when, dijitButton, WidgetContainer, Repeater, ScatterBuilder, ScatterWidget, ItemQueryExecutor, undefined) {

    return declare([],{

        store: undefined,
        forceNewLine: false,

        createWidgetProxy: function(config){
            var plotProperties = config.chart;
            var item_query = config.item_query;
            if (!plotProperties || !item_query) {
                return;
            }
            var supportedTypes = {
                "Scatter": 1
            };
            if (!supportedTypes[plotProperties.type]) {
                return;
            }

            return d_lang.hitch(this, function() {
                return this._buildWidget(plotProperties, item_query);
            });
        },

        deactivate: function () {
            if (this.refreshHandle) {
                this.refreshHandle.remove();
            }
        },

        _buildWidget: function (plotProperties, queryProperties){

            plotProperties = d_lang.clone(plotProperties);
            var executor = this._buildQueryExecutor(queryProperties);
            var plot = this._buildScatterWidget(plotProperties);
            var refreshButton = new dijitButton({'class': 'ctRefreshBtn', 'showLabel': false, 'iconClass': 'icon-sync'});
            refreshButton.set("title", this._i18n.get().refresh);

            // create widget container
            var container = new WidgetContainer({
                title: plotProperties.title,
                minWidth: undefined,
                minHeight: undefined,
                forceNewLine: plotProperties.forceNewLine
            });

            container.addChild(refreshButton);
            container.addChild(plot);

            var repeater = this._buildRepeater(executor, function(store) {
                plot.set("store", store);
            }, queryProperties.refresh);

            if(!queryProperties.ignorePreProcessors){
                container.own(
                    this._dashboardContext.watch("*", d_lang.hitch(this, function () {
                        this._triggerRefresh(repeater);
                    }))
                )
            }

            this._connectToDashboardVisibilityLifecycle(container, repeater);
            this.refreshHandle = d_on(refreshButton, "click", d_lang.hitch(this, function () {
                this._triggerRefresh(repeater);
            }));

            return container;
        },

        _triggerRefresh: function (repeater){
            repeater.stop();
            repeater.start();
        },

        _buildQueryExecutor: function (queryProperties){

            var preProcessors = this._queryPreProcessors || [];
            queryProperties = d_lang.clone(queryProperties);

            delete queryProperties.refresh;
            return new ItemQueryExecutor({
                query: queryProperties,
                // elastic store
                store: this.store,
                preProcessors: preProcessors
            });
        },

        _buildScatterWidget: function (plotProperties){
            this._addMinSize(plotProperties, plotProperties);
            plotProperties.chartBuilder = ScatterBuilder;
            plotProperties.chartOptions = {
                valueWidth: plotProperties.valueWidth,
                valueHeight: plotProperties.valueHeight,
                xname: plotProperties.xAxisLabel,
                yname: plotProperties.yAxisLabel,
                noValues :this._i18n.get().noValues,
                frequency: this._i18n.get().frequency,
                points: this._i18n.get().points,
                categories: this._i18n.get().categories
            };
            return new ScatterWidget (plotProperties);
        },

        _buildRepeater: function (executor,callback,refresh){
            return Repeater({
                callback: function() {
                    ct_when(executor.query(),callback,function(e){
                        console.error("plot update failed: " + e, e);
                    });
                },
                delay: refresh
            });
        },

        _connectToDashboardVisibilityLifecycle: function (container, repeater){
            container.watch("visibleOnDashboard", function(name, oldVal, newVal) {
                if (newVal) {
                    repeater.start();
                } else {
                    repeater.stop();
                    container.destroyRecursive();
                }
            });
        },

        _addMinSize: function(configProperties, viewProperties) {
            var height = viewProperties.height;
            var width = viewProperties.width;
            if (width) {
                configProperties.minWidth = width;
            }
            if (height) {
                configProperties.minHeight = height;
            }
            return configProperties;
        }
    })
});