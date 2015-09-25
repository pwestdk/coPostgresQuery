'use strict';

var base = function (client, tableName, exposedFields, searchableFields, sortableFields, idOptions, extraOptions) {
    idOptions = idOptions || {};
    var idFieldName = idOptions.name || 'id';
    var idAutoGenerated = !!idOptions.autogenerated;

    extraOptions = extraOptions || {};
    var historyTable = extraOptions.historyTable;
    var watchedFields = extraOptions.watchedFields || exposedFields;

    searchableFields = searchableFields || exposedFields;
    sortableFields = sortableFields || exposedFields;

    var select = require('./select')(client, tableName, exposedFields, idFieldName);

    var selectPage = require('./selectPage')(client, tableName, exposedFields, searchableFields, sortableFields, idOptions, extraOptions);

    var version = historyTable ? require('./version')(client, tableName, historyTable, exposedFields, idFieldName, idAutoGenerated) : null;

    var batchInsert = require('./batchInsert')(client, tableName, exposedFields, idFieldName, idAutoGenerated, version);

    var batchUpdate = require('./batchUpdate')(client, tableName, exposedFields, idFieldName);

    var batchDelete = require('./batchDelete')(client, tableName, exposedFields, idFieldName);

    var insertOne = require('./insertOne')(client, tableName, exposedFields, idAutoGenerated, idFieldName, version);

    var hasChange = require('./hasChange')(select, watchedFields);

    var updateOne = require('./updateOne')(client, tableName, exposedFields, idFieldName, idAutoGenerated, version, hasChange);

    var removeOne = require('./removeOne')(client, tableName, exposedFields, idFieldName, version);

    function* exists(entityId) {
        var result = yield client.query_('SELECT EXISTS(SELECT 1 FROM ' + tableName + ' WHERE ' + idFieldName + ' = $id)', {id: entityId});

        return result.rows[0].exists;
    }

    return {
        selectAll: select.selectAll,
        selectOne: select.selectOneById,
        selectOneById: select.selectOneById,
        selectPage: selectPage,
        countAll: select.countAll,
        batchDelete: batchDelete,
        batchInsert: batchInsert,
        batchUpdate: batchUpdate,
        insertOne: insertOne,
        updateOne: updateOne,
        removeOne: removeOne,
        exists: exists,
        refresh: select.refresh,
        version: version,
        hasChange: hasChange
    };
};

base.getFormattedDateField = function getFormattedDateField(fieldName, asName) {
    asName = asName || fieldName;
    return `to_char(${fieldName} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as ${asName}`;
};

module.exports = base;
