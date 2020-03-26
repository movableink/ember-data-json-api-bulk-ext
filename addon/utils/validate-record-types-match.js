import { assert } from '@ember/debug';

export default function validateRecordTypesMatch(serializedRecords) {
  assert(
    'All records must be the same type',
    serializedRecords.every((record) => record.type === serializedRecords[0].type)
  );
}
