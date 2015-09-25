'use strict';

var valueSubQuery = require('./valueSubQuery');

module.exports = function (client, tableName, fields, idAutoGenerated, idFieldName, version, returningFields = fields) {
    var getValueSubQuery = valueSubQuery(fields, idAutoGenerated, idFieldName);
    return function* insertOne(data, isWhitelisted) {
        var values = getValueSubQuery(data, null, isWhitelisted);
        var query = 'INSERT INTO ' + tableName + ' (' + values.columns.join(', ') + ') VALUES(' + values.query + ') RETURNING ' + returningFields.join(', ');
        var entity = (yield client.query_(query, values.parameters)).rows[0];
        if (!entity) {
            throw new Error('not found');
        }

        if (version) {
            yield version(entity, 'insert', true);
        }

        return entity;
    };
};
