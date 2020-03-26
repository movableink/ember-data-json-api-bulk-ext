import Store from '@ember-data/store';
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import { MIME_TYPE } from './constants';

function validateRecordTypesMatch(serializedRecords) {
  assert(
    'All records must be the same type',
    serializedRecords.every(record => record.type === serializedRecords[0].type)
  );
}

function buildAjaxOptions(adapterOptions, useExtensionMimeType) {
  const { headers: customHeaders, ...otherAdapterOptions } = adapterOptions;
  return useExtensionMimeType
    ? {
        headers: {
          Accept: MIME_TYPE,
          ...customHeaders
        },
        contentType: MIME_TYPE,
        ...otherAdapterOptions
      }
    : adapterOptions;
}

function getModelName(records) {
  const { modelName } = records[0]._internalModel.createSnapshot();

  return modelName;
}

function extendStore(StoreClass, { useExtensionMimeType = false } = {}) {
  return class StoreWithBulkActions extends StoreClass {
    async bulkSave(records, options) {
      const toCreate = records.filter(record => record.isNew);
      const toDelete = records.filter(record => record.isDeleted);
      const operations = [];

      if (toCreate.length) {
        operations.push(this.bulkCreate(toCreate, options));
      }

      if (toDelete.length) {
        operations.push(this.bulkDelete(toDelete, options));
      }

      await Promise.all(operations);

      return records;
    }

    async bulkCreate(records, { adapterOptions = {} } = {}) {
      if (isEmpty(records)) {
        return [];
      }

      assert(
        'All records must be new',
        records.every(record => record.isNew)
      );

      const serializedRecords = records
        .map(record => record.serialize())
        .map(payload => payload.data);

      validateRecordTypesMatch(serializedRecords);

      const modelName = getModelName(records);
      const adapter = this.adapterFor(modelName);

      const url = adapter.urlForCreateRecord(modelName);
      const payload = {
        data: serializedRecords
      };

      records.forEach(record => {
        record._internalModel.adapterWillCommit();
      });

      const response = await adapter.ajax(url, 'POST', {
        data: payload,
        ...buildAjaxOptions(adapterOptions, useExtensionMimeType)
      });
      const responseData = response.data;

      records.forEach((record, index) => {
        const { data } = this.normalize(modelName, responseData[index]);

        this.didSaveRecord(record._internalModel, { data }, 'createRecord');
      });

      return records;
    }

    async bulkDestroy(records, options) {
      records.forEach(record => {
        record.deleteRecord();
      });

      return this.bulkDelete(records, options);
    }

    async bulkDelete(records, { adapterOptions = {} } = {}) {
      if (isEmpty(records)) {
        return [];
      }

      assert(
        'All records must be deleted',
        records.every(record => record.isDeleted)
      );

      const serializedRecords = records
        .map(record => record.serialize({ includeId: true }))
        .map(payload => payload.data)
        .map(record => {
          delete record.attributes;

          return record;
        });

      validateRecordTypesMatch(serializedRecords);

      const modelName = getModelName(records);
      const adapter = this.adapterFor(modelName);

      const url = adapter.urlForCreateRecord(modelName);
      const payload = {
        data: serializedRecords
      };

      records.forEach(record => {
        record._internalModel.adapterWillCommit();
      });

      await adapter.ajax(url, 'DELETE', {
        data: payload,
        ...buildAjaxOptions(adapterOptions, useExtensionMimeType)
      });

      records.forEach(record => {
        this.didSaveRecord(record._internalModel, { data: undefined }, 'deleteRecord');
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
