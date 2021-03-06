import { assert } from 'chai';

import crudQueries from './crud';

describe('crud', () => {
    let crud;
    const table = 'table';
    const primaryKey = ['id1', 'id2'];
    const writableCols = ['col1', 'col2'];
    const returnCols = ['*'];
    const permanentFilters = { col3: 'foo' };

    before(() => {
        crud = crudQueries({ table, writableCols, primaryKey, returnCols, permanentFilters });
    });

    it('should initialize all queries with given parameters', () => {
        assert.deepEqual(Object.keys(crud), [
            'removeOne',
            'insertOne',
            'selectOne',
            'select',
            'updateOne',
            'batchInsert',
            'batchRemove',
            'countAll',
        ]);
    });
});
