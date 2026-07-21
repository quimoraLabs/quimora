/**
 * Clean and format a single document by converting Mongoose instances,
 * managing MongoDB key standards, and filtering relational payloads safely.
 * @param {Object} item - The raw document object or Mongoose document instance.
 * @param {String} commonKey - The populated relational key path to format.
 * @param {Array<String>} fieldsToKeep - Explicit child fields to retain from the populated block.
 * @returns {Object} Cleaned and flattened plain JavaScript object.
 */
const cleanSingleDocument = (item, commonKey, fieldsToKeep) => {
  if (!item) {
    throw new Error("Formatting Error: Target document is null or undefined!");
  }

  // Convert Mongoose document to a mutable plain JavaScript object safely
  const doc = typeof item.toObject === "function" ? item.toObject() : { ...item };

  // Normalize document identifiers across database interactions
  if (doc._id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  delete doc.__v;

  // Optimize and clean nested relational fields (e.g., quizId metadata structures)
  if (doc.quizId && typeof doc.quizId === "object") {
    if (doc.quizId._id) {
      doc.quizId.id = doc.quizId._id.toString();
      delete doc.quizId._id;
    }
    delete doc.quizId.__v;
    delete doc.quizId.isAvailable;
    delete doc.quizId.totalMarks;
  }

  // Dynamically extract and normalize specific populated fields if configured
  if (commonKey && doc[commonKey] && typeof doc[commonKey] === "object") {
    const populatedObject = doc[commonKey];
    const extractedFields = {};

    fieldsToKeep.forEach((field) => {
      if (populatedObject[field] !== undefined) {
        extractedFields[field] = populatedObject[field];
      }
    });

    // Generate a clean target field key name (e.g., 'createdBy' or 'user')
    const polishedKeyName = commonKey.endsWith("Id")
      ? commonKey.replace("Id", "")
      : commonKey;

    doc[polishedKeyName] = extractedFields;

    // Erase the original unformatted object property if the key string differed
    if (polishedKeyName !== commonKey) {
      delete doc[commonKey];
    }
  }

  return doc;
};

/**
 * Universal Utility: Format documents dynamically, remove database redundancy,
 * and seamlessly handle both Single Object entities and Array payload sets.
 * @param {Object|Array} inputData - Mongoose document array list or single document entity.
 * @param {String} commonKey - Relational key field to track and optimize (e.g., 'createdBy', 'userId').
 * @param {Array<String>} fieldsToKeep - Target parameter strings to safely preserve on populated objects.
 * @returns {Object|Array} Properly structured flat arrays or cleaned objects.
 */
export const formatUniversalResponse = (inputData, commonKey = null, fieldsToKeep = []) => {
  if (inputData === null || inputData === undefined) {
    return null;
  }

  // CASE 1: INPUT IS AN ARRAY
  if (Array.isArray(inputData)) {
    if (inputData.length === 0) return [];

    if (!inputData[0]) {
      throw new Error("Formatting Error: First element of the targeted payload collection is missing!");
    }

    return inputData.map((item) => cleanSingleDocument(item, commonKey, fieldsToKeep));
  }

  // CASE 2: INPUT IS A SINGLE OBJECT
  return cleanSingleDocument(inputData, commonKey, fieldsToKeep);
};