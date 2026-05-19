/**
 * Utility Helper: Array se duplicate reference data alag karta hai aur heavy arrays ki length handle karta hai.
 * @param {Array} records - Mongoose documents ka array
 * @param {String} populateKey - User/Instructor object ki key (Default: 'userId')
 * @param {String} arrayLengthKey - Wo heavy array jiska data chhupakar sirf size/length bhejna hai (Optional, e.g., 'questions' ya 'expenses')
 */
export const formatCleanResponse = (records, populateKey = "userId", arrayLengthKey = null) => {
  if (!Array.isArray(records) || records.length === 0) {
    return { user: null, data: [] };
  }

  // 1. Top par common user data nikal lo
  const firstRecord = records[0];
  const userData = firstRecord && firstRecord[populateKey] ? firstRecord[populateKey] : null;

  // 2. Data ko clean aur transform karo
  const cleanedData = records.map((item) => {
    // Document ko plain JS object me badlo safely
    const plainDoc = typeof item.toObject === "function" ? item.toObject() : { ...item };
    
    // 🔥 AUTOMATIC LENGTH CONVERSION: Agar koi heavy array key di hai, toh uski length set kar do
    if (arrayLengthKey && plainDoc[arrayLengthKey] && Array.isArray(plainDoc[arrayLengthKey])) {
      plainDoc[arrayLengthKey] = plainDoc[arrayLengthKey].length;
    }

    // Dynamically duplicate field remove karo
    delete plainDoc[populateKey]; 
    
    return plainDoc;
  });

  return {
    user: userData,
    data: cleanedData
  };
};