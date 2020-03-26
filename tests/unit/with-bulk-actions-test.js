import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';
import { MIME_TYPE } from 'ember-data-json-api-bulk-ext/constants';
import setupPretender from '../helpers/setup-pretender';
import { headers as headersMatch } from '../matchers/pretender';

@withBulkActions()
class StoreWithoutHeaderOptions extends Store {}

@withBulkActions({ useExtensionMimeType: true })
class StoreWithHeaderOptions extends Store {}

function setupStore(hooks, StoreClass = StoreWithoutHeaderOptions) {
  hooks.beforeEach(function () {
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreClass);

    this.store = this.owner.lookup('service:store');
  });
}

function setupPostHandler(hooks) {
  setupPretender(hooks);

  hooks.beforeEach(function () {
    this.postsHandler = td.function();
    this.server.post('/posts', this.postsHandler);
  });
}

module('Unit | withBulkActions', function (hooks) {
  setupTest(hooks);

  module('mime type options', function () {
    module('when enabled', function (hooks) {
      setupStore(hooks, StoreWithHeaderOptions);
      setupPostHandler(hooks);

      test('it sends the headers to the API', async function (assert) {
        td.when(
          this.postsHandler(headersMatch({ Accept: MIME_TYPE, 'Content-Type': MIME_TYPE }))
        ).thenReturn([
          201,
          {},
          JSON.stringify({
            data: [
              {
                type: 'posts',
                id: 1,
                attributes: {
                  title: 'My Post',
                },
              },
            ],
          }),
        ]);

        const record = this.store.createRecord('post', { title: 'My Post' });

        await this.store.bulkCreate([record]);

        assert.equal(record.id, 1, 'Creation was preformed successfully');
      });

      test('merging with other custom headers', async function (assert) {
        td.when(
          this.postsHandler(
            headersMatch({ Accept: MIME_TYPE, 'Content-Type': MIME_TYPE, Foo: 'Bar' })
          )
        ).thenReturn([
          201,
          {},
          JSON.stringify({
            data: [
              {
                type: 'posts',
                id: 1,
                attributes: {
                  title: 'My Post',
                },
              },
            ],
          }),
        ]);

        const record = this.store.createRecord('post', { title: 'My Post' });

        await this.store.bulkCreate([record], { adapterOptions: { headers: { Foo: 'Bar' } } });

        assert.equal(record.id, 1, 'Creation was preformed successfully');
      });
    });

    module('when disabled', function (hooks) {
      setupStore(hooks, StoreWithoutHeaderOptions);
      setupPostHandler(hooks);

      test('it does not send the headers to the API', async function (assert) {
        td.when(
          this.postsHandler(
            headersMatch({
              Accept: 'application/vnd.api+json',
              'Content-Type': 'application/vnd.api+json',
            })
          )
        ).thenReturn([
          201,
          {},
          JSON.stringify({
            data: [
              {
                type: 'posts',
                id: 1,
                attributes: {
                  title: 'My Post',
                },
              },
            ],
          }),
        ]);

        const record = this.store.createRecord('post', { title: 'My Post' });

        await this.store.bulkCreate([record]);

        assert.equal(record.id, 1, 'Creation was preformed successfully');
      });
    });
  });

  module('overriding adapter options', function (hooks) {
    setupStore(hooks, StoreWithHeaderOptions);
    setupPretender(hooks);

    test('it allows overriding the default URL', async function (assert) {
      const handler = td.function();
      this.server.post('/override-url', handler);

      td.when(handler(td.matchers.anything())).thenReturn([
        201,
        {},
        JSON.stringify({
          data: [
            {
              type: 'posts',
              id: 1,
              attributes: {
                title: 'My Post',
              },
            },
          ],
        }),
      ]);

      const record = this.store.createRecord('post', { title: 'My Post' });

      await this.store.bulkCreate([record], { adapterOptions: { url: '/override-url' } });

      assert.equal(record.id, 1, 'Creation was preformed successfully');
    });
  });

  module('using the decorator without calling it as a function', function (hooks) {
    @withBulkActions
    class CustomStore extends Store {}

    setupStore(hooks, CustomStore);

    test('the additional methods are injected into the store', function (assert) {
      assert.ok(this.store.bulkCreate, 'The extension was applied successfully');
    });
  });

  module('validating the class the decorator is applied to', function () {
    test('does not work when applied to a non-Ember Data Store class', function (assert) {
      assert.throws(
        function () {
          @withBulkActions()
          class FooBar {} // eslint-disable-line no-unused-vars
        },
        /Decorator must be applied to the Ember Data Store/,
        'Asserts that the class applied to is the Ember Data Store'
      );
    });

    test('works with a subclass of the Ember Data Store', function (assert) {
      class StoreSubclass extends Store {}

      @withBulkActions()
      class SubclassWithExtension extends StoreSubclass {}

      this.owner.unregister('service:store');
      this.owner.register('service:store', SubclassWithExtension);

      const instance = this.owner.lookup('service:store');

      assert.ok(instance.bulkCreate, 'Custom subclass was extended');
    });
  });
});
