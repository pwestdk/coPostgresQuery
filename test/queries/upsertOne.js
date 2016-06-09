import upsertOneQuerier from '../../lib/queries/upsertOne';

describe('QUERY upsertOne', function () {

    it('should generate sql and parameter for upserting one entity', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, id2, fielda, fieldb)
VALUES ($id1, $id2, $fielda, $fieldb)
ON CONFLICT (id1, id2)
DO UPDATE SET fielda = $fielda, fieldb = $fieldb
RETURNING *`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should generate sql and parameter for upserting one entity using same order for (field...) and VALUES(field...)', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id' ], ['field']);
        assert.deepEqual(upsertOneQuery({ field: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, field)
VALUES ($id, $field)
ON CONFLICT (id)
DO UPDATE SET field = $field
RETURNING *`
            ),
            parameters: {
                id: 1,
                field: 'value'
            }
        });
    });

    it('should not try to update field not passed in entity', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id' ], ['fielda', 'fieldb']);
        assert.deepEqual(upsertOneQuery({ fielda: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, fielda)
VALUES ($id, $fielda)
ON CONFLICT (id)
DO UPDATE SET fielda = $fielda
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda: 'value'
            }
        });
    });

    it('should DO NOTHING on conflict when no value provided to updatable field', function () {
        const upsertOneQuery = upsertOneQuerier('table', ['id'], ['field']);
        assert.deepEqual(upsertOneQuery({ id: 1 }), {
            sql: (
`INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`
            ),
            parameters: {
                id: 1
            }
        });
    });

    it('should accept to have no updatableFields', function () {
        const upsertOneQuery = upsertOneQuerier('table', ['id'], []);
        assert.deepEqual(upsertOneQuery({ id: 1 }), {
            sql: (
`INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`
            ),
            parameters: {
                id: 1
            }
        });
    });
});