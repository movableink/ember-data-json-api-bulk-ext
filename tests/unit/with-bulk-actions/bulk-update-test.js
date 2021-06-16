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
    this.store.pushPayload({ data: { id: '2', type: 'post' } });

    this.firstPost = this.store.peekRecord('post', 1);
    this.secondPost = this.store.peekRecord('post', 2);
  });
}

function setupPostHandler(hooks) {
  setupPretender(hooks);

  hooks.beforeEach(function () {
    this.postsHandler = td.function();
    this.postsPatchHandler = td.function();
    this.server.post('/posts', this.postsHandler);
    this.server.patch('/posts', this.postsPatchHandler);
    this.server.patch('/posts/:id', this.postsPatchHandler);
  });
}

module('Unit | withBulkActions | bulkUpdate', function (hooks) {
  setupTest(hooks);
  setupStore(hooks);
  setupPostHandler(hooks);

  test('it does not interfere with normal update', async function (assert) {
    td.when(
      this.postsPatchHandler(
        payloadMatches({ data: { id: '1', attributes: { title: 'First Post' }, type: 'posts' } })
      )
    ).thenReturn([
      200,
      {},
      JSON.stringify({
        data: {
          type: 'posts',
          id: 1,
          attributes: {
            title: 'First Post',
          },
        },
      }),
    ]);

    this.firstPost.title = 'First Post';

    const first = await this.firstPost.save();

    assert.equal(first.title, 'First Post', 'The record is updated with new title');
  });

  test('it can update multiple models at once', async function (assert) {
    td.when(
      this.postsPatchHandler(
        payloadMatches({
          data: [
            { id: '1', attributes: { title: 'First Post' }, type: 'posts' },
            { id: '2', attributes: { title: 'Second Post' }, type: 'posts' },
          ],
        })
      )
    ).thenReturn([
      200,
      {},
      JSON.stringify({
        data: [
          {
            type: 'posts',
            id: '1',
            attributes: {
              title: 'First Post',
            },
          },
          {
            type: 'posts',
            id: '2',
            attributes: {
              title: 'Second Post',
            },
          },
        ],
      }),
    ]);

    this.firstPost.title = 'First Post';
    this.secondPost.title = 'Second Post';

    const [first, second] = await this.store.bulkUpdate([this.firstPost, this.secondPost]);

    assert.equal(first.title, this.firstPost.title, 'The first record is updated with new title');
    assert.equal(
      second.title,
      this.secondPost.title,
      'The second record is updated with new title'
    );

    assert.equal(
      this.store.peekAll('post').length,
      2,
      'It does not add additional records to the Ember Data store'
    );
  });
});
