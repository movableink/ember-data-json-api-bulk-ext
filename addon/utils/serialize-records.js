export default function serializeRecords(records, serializationOptions = {}) {
  return records
    .map((record) => record.serialize(serializationOptions))
    .map((payload) => payload.data);
}
