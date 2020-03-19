import { assert } from '@ember/debug';

export function withBulkActions(StoreClass) {
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

      const response = await adapter.ajax(url, 'POST', { data: payload });
      const responseData = response.data;

      records.forEach((record, index) => {
        const { data } = this.normalize(modelName, responseData[index]);

        this.didSaveRecord(record._internalModel, { data }, 'createRecord');
      });

      return records;
    }
  };
}