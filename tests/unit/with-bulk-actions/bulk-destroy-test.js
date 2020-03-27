import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';

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

module('Unit | withBulkActions | bulkDestroy', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);

  test('deleting multiple records', async function (assert) {
    td.replace(this.store, 'bulkDelete');
    const options = {};

    await this.store.bulkDestroy([this.post], options);

    assert.ok(this.post.isDeleted, 'Marked the post as deleted');
    assert.verify(this.store.bulkDelete([this.post], options), 'Called `bulkDestroy` internally');
  });
});
