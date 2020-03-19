import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { withHeaders, MIME_TYPE } from 'ember-data-json-api-bulk-ext/with-headers';
import setupPretender from '../helpers/setup-pretender';
import { headers as headersMatch } from '../matchers/pretender';

module('Unit | withHeaders', function(hooks) {
  setupTest(hooks);
  setupPretender(hooks);

  test('when the base has no headers', function(assert) {
    @withHeaders
    class Adapter extends JSONAPIAdapter {}

    const instance = Adapter.create();

    assert.deepEqual(instance.headers, {
      Accept: MIME_TYPE,
      'Content-Type': MIME_TYPE
    });
  });

  test('when the base has unrelated headers', function(assert) {
    @withHeaders
    class Adapter extends JSONAPIAdapter {
      get headers() {
        return { Foo: 'Bar' };
      }
    }

    const instance = Adapter.create();

    assert.deepEqual(instance.headers, {
      Accept: MIME_TYPE,
      'Content-Type': MIME_TYPE,
      Foo: 'Bar'
    });
  });

  test('when the base a related header', function(assert) {
    @withHeaders
    class Adapter extends JSONAPIAdapter {
      get headers() {
        return { Accept: 'Foo' };
      }
    }

    const instance = Adapter.create();

    assert.deepEqual(instance.headers, {
      Accept: MIME_TYPE,
      'Content-Type': MIME_TYPE
    });
  });

  test('makes a request with the given headers', async function(assert) {
    const handler = td.function();
    td.when(handler(headersMatch({ Accept: MIME_TYPE, 'Content-Type': MIME_TYPE }))).thenReturn([
      200,
      {},
      '{}'
    ]);

    this.server.get('/foo', handler);

    @withHeaders
    class Adapter extends JSONAPIAdapter {}

    this.owner.register('adapter:application', Adapter);

    const instance = this.owner.lookup('adapter:application');
    const result = await instance.ajax('/foo', 'GET');

    assert.deepEqual(result, {}, 'Recieved mock response from Pretender');
  });
});
