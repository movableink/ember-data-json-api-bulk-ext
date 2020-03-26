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
  });
}

module('Unit | withBulkActions | bulkSave', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);

  test('it can save and delete records', async function (assert) {
    td.replace(this.store, 'bulkCreate');
    td.replace(this.store, 'bulkDelete');

    const options = {};

    this.store.pushPayload({ data: { id: '1', type: 'post' } });
    const toBeDeleted = this.store.peekRecord('post', 1);
    toBeDeleted.deleteRecord();

    const toBeCreated = this.store.createRecord('post', { title: 'Created Post' });

    await this.store.bulkSave([toBeCreated, toBeDeleted], options);

    assert.verify(this.store.bulkCreate([toBeCreated], options), 'Created the record');
    assert.verify(this.store.bulkDelete([toBeDeleted], options), 'Deleted the record');
  });
});
