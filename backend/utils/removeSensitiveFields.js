// A reusable utility function for cleaning up Mongoose documents
export const removeSensitiveFields = (fields) => {
  return function (doc, ret) {
    fields.forEach((field) => delete ret[field]);
    return ret;
  };
};