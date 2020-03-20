import Store from '@ember-data/store';
import { assert } from '@ember/debug';
import { MIME_TYPE } from './constants';

function extendStore(StoreClass, { useExtensionMimeType = false } = {}) {
  return class StoreWithBulkActions extends StoreClass {
    async bulkCreate(records) {
      assert(
        'All records must be new',
        records.every(record => record.isNew)
      );

      const serializedRecords = records.map(record => record.serialize());

      assert(
        'All records must be the same type',
        serializedRecords.every(record => record.data.type === serializedRecords[0].data.type)
      );

      const { modelName } = records[0]._internalModel.createSnapshot();
      const adapter = this.adapterFor(modelName);

      const url = adapter.urlForCreateRecord(modelName);
      const payload = {
        data: serializedRecords.map(record => record.data)
      };

      records.forEach(record => {
        record._internalModel.adapterWillCommit();
      });

      const requestOptions = useExtensionMimeType
        ? {
            headers: {
              Accept: MIME_TYPE
            },
            contentType: MIME_TYPE
          }
        : {};

      const response = await adapter.ajax(url, 'POST', { data: payload, ...requestOptions });
      const responseData = response.data;

      records.forEach((record, index) => {
        const { data } = this.normalize(modelName, responseData[index]);

        this.didSaveRecord(record._internalModel, { data }, 'createRecord');
      });

      return records;
    }
  };
}

export function withBulkActions(arg) {
  // Decorator is not called as a function
  if (arg && arg.prototype instanceof Store) {
    return extendStore(arg);
  }

  return function(StoreClass) {
    assert(
      'Decorator must be applied to the Ember Data Store',
      StoreClass.prototype instanceof Store
    );

    return extendStore(StoreClass, arg);
  };
}
