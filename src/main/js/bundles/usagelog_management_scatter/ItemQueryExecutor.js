/*
 *  Copyright (C) con terra GmbH (http://www.conterra.de)
 *  All rights reserved
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/date/stamp",
    "dojo/date/locale",
    "ct/_when",
    "ct/store/ComplexMemory"
], function(declare, d_lang, d_array, stamp, locale, ct_when, ComplexMemory) {
    /*
     * Executes item queries for specific return fields.
     * Transforms the result into an store.
     */
    return declare([], {
        constructor: function(opts) {
            opts = opts || {};
            this._countOnly = opts.countOnly || false;
            this._queryParams = opts.query || {};
            this._store = opts.store;
            this._preProcessors = opts.preProcessors || [];
        },

        query: function() {
            var queryJson = this._buildItemQueryFromConfig(this._queryParams);
            if(!this._queryParams.ignorePreProcessors){
                queryJson = this._preProcessQuery(queryJson);
            }
            return ct_when(this._store.elasticQuery(queryJson), function(response) {
                return this._transformQueryResponse(response);
            }, this);
        },
        _preProcessQuery: function(queryJson){
            var queryJson = d_lang.clone(queryJson);
            d_array.forEach(this._preProcessors, function(preProcessor){
                queryJson = preProcessor.preProcessQuery(queryJson);
            });
            return queryJson;
        },
        _transformQueryResponse: function(response) {
            var hits = response.hits || {};
            return  this._countOnly ? hits.total : this._toStore(hits);
        },
        _buildItemQueryFromConfig: function(config) {
            var queryJson = {
                "size": this._countOnly ? 0 : config.itemCount,
                "fields": config.returnFields,
                "query": {
                    "filtered": {
                        "query": {
                            "query_string": {
                                "query": config.query,
                                "analyze_wildcard": true
                            }
                        }
                    }
                }
            };
            var timeConfig = config.time || {};
            if (timeConfig.rangetype === "relative") {
                var timeFilter = this._createTimeFilter(config.time.relative);
                queryJson.query.filtered.filter = timeFilter;
            }
            if (config.sort) {
                var sortTerm = this._createSortTerm(config.sort);
                queryJson.sort = sortTerm;
            }
            return queryJson;
        },
        _createTimeFilter: function(minutesBeforeNow) {
            var now = new Date().getTime();
            var before = now - minutesBeforeNow * 60000; // Minutes in ms
            return {
                "bool": {
                    "must": [{
                            "range": {
                                "timestamp": {
                                    "gte": before,
                                    "lte": now
                                }
                            }
                        }]
                }
            };
        },
        _createSortTerm: function(sortProperties) {
            var sortTerm = {};
            sortTerm[sortProperties.sortField] = {order: sortProperties.order};
            return sortTerm;
        },
        _toStore: function(hits) {
            var returnFields = this._queryParams.returnFields;
            var dataArray = hits.hits || [];
            var total = hits.total || 0;
            var items = [];
            d_array.forEach(dataArray, function(hit, index) {
                if (!hit.fields) {
                    return;
                }
                var item = {
                    id: index
                };
                d_array.forEach(returnFields, function(field) {
                    var property = hit.fields[field] || [];
                    var value = property[0];
                    if(!value && value !== false){
                        value = "";
                    }
                    // convert timestamp field to local + human-readable format
                    var convertedValue;
                    if(field === "event_timestamp" && value !== ""){
                        var isoDate = stamp.fromISOString(value);
                        convertedValue = locale.format(isoDate,{
                            datePattern: "dd.MM.yyyy",
                            timePattern: "hh:mm:ss,SSS a",
                            am: "am",
                            pm: "pm"
                        });
                    }

                    item[field] = convertedValue || value;
                });
                items.push(item);
            }, this);

            var metadata = {
                fields: []
            };
            d_array.forEach(returnFields, function(field) {
                metadata.fields.push({
                    type: typeof (field),
                    name: field
                });
            }, this);

            return new ComplexMemory({
                idProperty: "id",
                data: items,
                metadata: metadata,
                // for counter widget
                total: total
            });
        }
    });
});
