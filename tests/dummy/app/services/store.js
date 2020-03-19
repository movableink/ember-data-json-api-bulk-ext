import Store from '@ember-data/store';
import { withBulkActions } from 'ember-data-json-api-bulk-ext';

@withBulkActions
export default class CustomStore extends Store {}
