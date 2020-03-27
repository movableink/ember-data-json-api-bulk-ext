export default function getModelName([record]) {
  const { modelName } = record._internalModel.createSnapshot();

  return modelName;
}
