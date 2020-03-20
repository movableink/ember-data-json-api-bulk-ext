import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';
import setupPretender from '../helpers/setup-pretender';
import { payload as payloadMatches } from '../matchers/pretender';

module('Unit | withBulkActions', function(hooks) {
  setupTest(hooks);
  setupPretender(hooks);

  hooks.beforeEach(function() {
    this.store = this.owner.lookup('service:store');

    this.postsHandler = td.function();
    this.server.post('/posts', this.postsHandler);
  });

  module('bulkCreate', function() {
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
});
