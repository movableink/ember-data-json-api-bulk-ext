import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';
import setupPretender from '../../helpers/setup-pretender';
import { payload as payloadMatches } from '../../matchers/pretender';

@withBulkActions()
class StoreWithoutHeaderOptions extends Store {}

function setupStore(hooks) {
  hooks.beforeEach(function () {
    this.owner.unregister('service:store');
    this.owner.register('service:store', StoreWithoutHeaderOptions);

    this.store = this.owner.lookup('service:store');
    this.store.pushPayload({ data: { id: '1', type: 'post' } });

    this.post = this.store.peekRecord('post', 1);
  });
}

function setupDeleteHandler(hooks) {
  setupPretender(hooks);

  hooks.beforeEach(function () {
    this.deleteHandler = td.function();
    this.server.delete('/posts', this.deleteHandler);
  });
}

module('Unit | withBulkActions | bulkDelete', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);
  setupDeleteHandler(hooks);

  test('it allows an empty array to be passed', async function (assert) {
    assert.deepEqual(await this.store.bulkDelete([]), [], 'Allows an empty array');
  });

  test('deleting multiple records', async function (assert) {
    td.when(
      this.deleteHandler(
        payloadMatches({
          data: [{ type: 'posts', id: '1' }],
        })
      )
    ).thenReturn([204, {}, '']);

    this.post.deleteRecord();

    await this.store.bulkDelete([this.post]);

    assert.ok(this.post.isDeleted, 'Marked the post as deleted');
  });
});
