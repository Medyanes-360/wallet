import prisma from "../../../prisma";

export async function getAllData(tableName, where = {}) {
  try {
    const data = await prisma[tableName].findMany({
      where: where,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

export async function getUniqueData(tableName, where) {
  try {
    const data = await prisma[tableName].findUnique({
      where: where,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// POST
export async function createNewData(tableName, newData) {
  try {
    const data = await prisma[tableName].create({ data: newData });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// UPDATE
export async function updateDataByAny(tableName, where, newData) {
  try {
    const data = await prisma[tableName].update({
      where: where,
      data: newData,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

//DELETE
export async function deleteDataByAny(tableName, where) {
  try {
    const data = await prisma[tableName].delete({ where: where });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

//DELETE ALL
export async function deleteDataAll(tableName) {
  try {
    const data = await prisma[tableName].deleteMany({});
    return data;
  } catch (error) {
    return { error: error.message };
  }
}
