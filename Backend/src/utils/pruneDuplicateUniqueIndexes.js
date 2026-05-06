function normalizeFieldList(index) {
  return index.fields
    .map((field) => field.attribute || field.name)
    .filter(Boolean)
    .join(',');
}

async function tableExists(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch (error) {
    return false;
  }
}

async function pruneDuplicateUniqueIndexes(sequelize) {
  if (sequelize.getDialect() !== 'mysql') {
    return;
  }

  const queryInterface = sequelize.getQueryInterface();

  for (const model of Object.values(sequelize.models)) {
    const tableName = model.getTableName();
    const preferredIndexNames = new Set(
      (model.options.indexes || [])
        .map((index) => index.name)
        .filter(Boolean)
    );

    if (!(await tableExists(queryInterface, tableName))) {
      continue;
    }

    const indexes = await queryInterface.showIndex(tableName);
    const uniqueIndexesByFields = new Map();

    for (const index of indexes) {
      if (!index.unique || index.primary) {
        continue;
      }

      const fieldKey = normalizeFieldList(index);
      const matchingIndexes = uniqueIndexesByFields.get(fieldKey) || [];
      matchingIndexes.push(index);
      uniqueIndexesByFields.set(fieldKey, matchingIndexes);
    }

    for (const duplicateIndexes of uniqueIndexesByFields.values()) {
      const preferredIndex = duplicateIndexes.find((index) => preferredIndexNames.has(index.name));
      const indexToKeep = preferredIndex || duplicateIndexes[0];
      const indexesToRemove = duplicateIndexes.filter((index) => index.name !== indexToKeep.name);

      for (const index of indexesToRemove) {
        await queryInterface.removeIndex(tableName, index.name);
        console.log(`Removed duplicate unique index ${index.name} from ${tableName}.`);
      }
    }
  }
}

module.exports = pruneDuplicateUniqueIndexes;
