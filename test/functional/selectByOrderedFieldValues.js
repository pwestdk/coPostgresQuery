import { selectByOrderedFieldValuesQuery } from '../../lib';

describe('functional selectByOrderedFieldValues', () => {
    let authors;

    before(function* () {
        authors = yield [
            { name: 'doe', firstname: 'john' },
            { name: 'doe', firstname: 'jane' },
            { name: 'simon', firstname: 'will' },
        ]
        .map(fixtureLoader.addAuthor);
    });

    it('should select entity by id once executed and keep order', function* () {
        const selectByIds = db.link(selectByOrderedFieldValuesQuery({
            table: 'author',
            selectorField: 'id',
            returnFields: [
                'id',
                'name',
                'firstname',
            ],
        }));

        const result1 = yield selectByIds([authors[0].id, authors[1].id]);
        assert.deepEqual(result1, [authors[0], authors[1]]);

        const result2 = yield selectByIds([authors[1].id, authors[0].id]);
        assert.deepEqual(result2, [authors[1], authors[0]]);
    });

    it('should select entity by name (same value for several entry) once executed and keep order',
    function* () {
        const selectByIds = db.link(selectByOrderedFieldValuesQuery({
            table: 'author',
            selectorField: 'name',
            returnFields: [
                'id',
                'name',
                'firstname',
            ],
        }));

        const result1 = yield selectByIds([authors[0].name, authors[2].name]);
        assert.deepEqual(result1, [authors[0], authors[1], authors[2]]);

        const result2 = yield selectByIds([authors[2].name, authors[1].name]);
        assert.deepEqual(result2, [authors[2], authors[0], authors[1]]);
    });

    after(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
