// A reusable utility function for cleaning up Mongoose documents
export const removeSensitiveFields = (fields) => {
  return function (doc, ret) {
    fields.forEach((field) => delete ret[field]);
    return ret;
  };
};

/**
 * Compares incoming payload with existing Mongoose document.
 * Returns true if at least one field has a different value.
 */
export const hasFieldChanges = (incomingData, existingDoc) => {
  return Object.keys(incomingData).some((key) => {
    const newValue = incomingData[key];
    const existingValue = existingDoc[key];

    if (newValue === undefined) return false;

    // Handle Array / Object comparison safely
    if (typeof newValue === "object" && newValue !== null) {
      return JSON.stringify(newValue) !== JSON.stringify(existingValue);
    }

    // Handle Primitive types (string, number, boolean, Date)
    if (newValue instanceof Date || existingValue instanceof Date) {
      return new Date(newValue).getTime() !== new Date(existingValue).getTime();
    }

    return newValue !== existingValue;
  });
};