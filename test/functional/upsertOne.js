import moment from 'moment';

import { upsertOne as upsertOneQuery } from '../../lib';

describe('upsertOne', () => {
    let post;
    let upsertOne;
    const currentMonth = moment().endOf('month').startOf('day')
    .toDate();
    const lastMonth = moment().subtract(1, 'month').endOf('month')
    .startOf('day')
    .toDate();

    before(() => {
        upsertOne = db.link(upsertOneQuery({
            table: 'post',
            primaryKey: ['author', 'date'],
            writableCols: ['author', 'date', 'title'],
        }));
    });

    beforeEach(function* () {
        post = yield fixtureLoader.addPost({ author: 'john', date: currentMonth, title: 'title' });
    });

    it('should create unexisting rows', function* () {
        const newPost = { author: 'jane', date: lastMonth, title: 'title2' };
        yield upsertOne(newPost);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));
        const lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1' }))
        .map(lastTag => lastTag.id)[0];

        assert.deepEqual(updsertedPosts, [
            post,
            {
                id: lastId,
                ...newPost,
            },
        ]);
    });

    it('should create rows when not all selector match', function* () {
        const newPost = { author: 'john', date: lastMonth, title: 'john last month' };
        const result = yield upsertOne(newPost);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));
        const lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1' }))
        .map(lastTag => lastTag.id)[0];

        assert.deepEqual(result, {
            id: lastId,
            ...newPost,
        });

        assert.deepEqual(updsertedPosts, [
            post,
            {
                id: lastId,
                ...newPost,
            },
        ]);
    });

    it('should update existing row (both selector values match)', function* () {
        const updatedPost = { author: 'john', date: currentMonth, title: 'updated title' };
        const result = yield upsertOne(updatedPost);
        assert.deepEqual(result, {
            id: post.id,
            ...updatedPost,
        });

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));

        assert.deepEqual(updsertedPosts, [
            {
                id: post.id,
                ...updatedPost,
            },
        ]);
    });

    it('should update nothing when selector match but no update value are provided', function* () {
        const updatedPost = { author: 'john', date: currentMonth };
        const result = yield upsertOne(updatedPost);
        assert.deepEqual(result, post);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));

        assert.deepEqual(updsertedPosts, [post]);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE post CASCADE' });
    });
});
