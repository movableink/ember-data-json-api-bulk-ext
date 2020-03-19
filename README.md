# ember-data-json-api-bulk-ext

![.github/workflows/verify.yml](https://github.com/movableink/ember-data-json-api-bulk-ext/workflows/.github/workflows/verify.yml/badge.svg)

Decorator to add support to Ember Data for the [JSON:API Bulk Extension](https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/bulk/index.md).

## Compatibility

- Ember.js v3.12 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## Installation

```
ember install ember-data-json-api-bulk-ext
```

If you have not yet created a subclass of the Ember Data Store, do so now. You will want to import and apply the decorator to this class.

```javascript
// app/services/store.js
import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';

@withBulkActions
export default class CustomStore extends Store {}
```

## Usage

With the decorator applied to your Store subclass, you'll have new methods on the store available to you for dealing with bulk API actions.

```javascript
const first = this.store.createRecord('post', { title: 'First Post' });
const second = this.store.createRecord('post', { title: 'Second Post' });

await this.store.bulkCreate([first, second]);

assert.ok(first.id, 'First record was given an ID');
assert.ok(second.id, 'First record was given an ID');
```

Note the following limitations:

- The models being operated on _must_ use the `JSONAPIAdapter` and `JSONAPISerializer`
- All records must be of the same type (for now)
- Records can only be created in bulk (for now)

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
