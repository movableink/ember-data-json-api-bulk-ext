import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';
import { MIME_TYPE } from 'ember-data-json-api-bulk-ext/constants';
import setupPretender from '../helpers/setup-pretender';
import { headers as headersMatch, payload as payloadMatches } from '../matchers/pretender';

@withBulkActions()
class StoreWithoutHeaderOptions extends Store {}

@withBulkActions({ useExtensionMimeType: true })
class StoreWithHeaderOptions extends Store {}

function setupStore(hooks, StoreClass = StoreWithoutHeaderOptions) {
  hooks.beforeEach(function() {
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreClass);

    this.store = this.owner.lookup('service:store');
  });
}

function setupPostHandler(hooks) {
  setupPretender(hooks);

  hooks.beforeEach(function() {
    this.postsHandler = td.function();
    this.server.post('/posts', this.postsHandler);
  });
}

module('Unit | withBulkActions', function(hooks) {
  setupTest(hooks);

  module('mime type options', function() {
    module('when enabled', function(hooks) {
      setupStore(hooks, StoreWithHeaderOptions);
      setupPostHandler(hooks);

      test('it sends the headers to the API', async function(assert) {
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
                  title: 'My Post'
                }
              }
            ]
          })
        ]);

        const record = this.store.createRecord('post', { title: 'My Post' });

        await this.store.bulkCreate([record]);

        assert.equal(record.id, 1, 'Creation was preformed successfully');
      });
    });

    module('when disabled', function(hooks) {
      setupStore(hooks, StoreWithoutHeaderOptions);
      setupPostHandler(hooks);

      test('it does not send the headers to the API', async function(assert) {
        td.when(
          this.postsHandler(
            headersMatch({
              Accept: 'application/vnd.api+json',
              'Content-Type': 'application/vnd.api+json'
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
                  title: 'My Post'
                }
              }
            ]
          })
        ]);

        const record = this.store.createRecord('post', { title: 'My Post' });

        await this.store.bulkCreate([record]);

        assert.equal(record.id, 1, 'Creation was preformed successfully');
      });
    });
  });

  module('bulkCreate', function(hooks) {
    setupStore(hooks);
    setupPostHandler(hooks);

    test('it does not interfere with normal creation', async function(assert) {
      td.when(
        this.postsHandler(
          payloadMatches({ data: { type: 'posts', attributes: { title: 'First Post' } } })
        )
      ).thenReturn([
        201,
        {},
        JSON.stringify({
          data: {
            type: 'posts',
            id: 1,
            attributes: {
              title: 'First Post'
            }
          }
        })
      ]);

      const first = this.store.createRecord('post', { title: 'First Post' });

      await first.save();

      assert.equal(first.id, 1, 'Recieved an ID from the API');
    });

    test('it can create multiple models at once', async function(assert) {
      td.when(
        this.postsHandler(
          payloadMatches({
            data: [
              { type: 'posts', attributes: { title: 'First Post' } },
              { type: 'posts', attributes: { title: 'Second Post' } }
            ]
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
                title: 'First Post'
              }
            },
            {
              type: 'posts',
              id: 2,
              attributes: {
                title: 'Second Post'
              }
            }
          ]
        })
      ]);

      const first = this.store.createRecord('post', { title: 'First Post' });
      const second = this.store.createRecord('post', { title: 'Second Post' });

      const result = await this.store.bulkCreate([first, second]);

      assert.equal(first.id, 1, 'The first record is updated with an ID');
      assert.equal(second.id, 2, 'The second record is updated with an ID');
      assert.deepEqual(result, [first, second], 'Returns the created records');

      assert.equal(
        this.store.peekAll('post').length,
        2,
        'It does not add additional records to the Ember Data store'
      );
    });
  });

  module('using the decorator without calling it as a function', function(hooks) {
    @withBulkActions
    class CustomStore extends Store {}

    setupStore(hooks, CustomStore);

    test('the additional methods are injected into the store', function(assert) {
      assert.ok(this.store.bulkCreate, 'The extension was applied successfully');
    });
  });

  module('validating the class the decorator is applied to', function() {
    test('does not work when applied to a non-Ember Data Store class', function(assert) {
      assert.throws(
        function() {
          @withBulkActions()
          class FooBar {} // eslint-disable-line no-unused-vars
        },
        /Decorator must be applied to the Ember Data Store/,
        'Asserts that the class applied to is the Ember Data Store'
      );
    });

    test('works with a subclass of the Ember Data Store', function(assert) {
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
