import { assert } from 'chai';
import flattenParameters from './flatten';

describe('flatten', () => {
    it('should flatten key containing array', () => {
        assert.deepEqual(flattenParameters({ field: ['value', 'other value', 'etc'] }), {
            field1: 'value',
            field2: 'other value',
            field3: 'etc',
        });
    });

    it('should not change other key', () => {
        assert.deepEqual(flattenParameters({ field: 'value', otherField: 'other value' }), {
            field: 'value',
            otherField: 'other value',
        });
    });

    it('should throw an error if flattened key would overwrite existing key', () => {
        assert.throw(
            () => flattenParameters({
                field: ['value', 'other value', 'etc'],
                field1: 'already here',
            }),
            'Cannot flatten "field:[value,other value,etc]" parameter, "field1" already exists'
        );
    });
});