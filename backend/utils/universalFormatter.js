/**
 * Isolated Helper: Specialized in formatting quiz questions and nested options.
 * @param {Object} doc - Plain JavaScript object from Mongoose document
 * @param {Boolean} isArrayMode - True if processing a list/loop, false for a single object
 */
const handleQuizQuestions = (doc, isArrayMode) => {
  // Safe check in case the document is accidentally missing.
  if (!doc || !doc.questions || !Array.isArray(doc.questions)) return;

  // Case A: For array lists, reduce payload size by sending only the count
  if (isArrayMode) {
    doc.questionsCount = doc.questions.length;
    delete doc.questions;
    return;
  }

  // Case B: For single object details, retain the array but strip internal IDs
  doc.questions = doc.questions.map((q) => {
    if (!q) return q;
    const plainQ = typeof q.toObject === "function" ? q.toObject() : { ...q };
    
    delete plainQ._id;
    delete plainQ.__v;

    // Sanitize nested option IDs inside each question
    if (plainQ.options && Array.isArray(plainQ.options)) {
      plainQ.options = plainQ.options.map((opt) => {
        if (!opt) return opt;
        const plainOpt = typeof opt.toObject === "function" ? opt.toObject() : { ...opt };
        delete plainOpt._id;
        return plainOpt;
      });
    }
    return plainQ;
  });
};

/**
 * Universal Utility: Format documents dynamically, remove redundancy, and handle both Single Objects and Arrays.
 * @param {Object|Array} inputData - Mongoose document(s) to clean
 * @param {String} commonKey - The populate field to optimize at top-level (e.g., 'userId', 'instructorId')
 * @param {Array} fieldsToKeep - Specific fields to retain from the populated object
 * @returns {Object|Array} Properly formatted clean response
 */
export const formatUniversalResponse = (inputData, commonKey = null, fieldsToKeep = []) => {
  // 🚨 If the entire input is empty, return safely without throwing an error.
  if (inputData === null || inputData === undefined) return null;

  // Core formatting block executed for every individual document
  const cleanSingle = (item, isArrayMode = false) => {
    // 🚨 Throw an error if an array item is null or undefined to make debugging easier.
    if (!item) {
      throw new Error("Formatting Error: Array contains a null or undefined document!");
    }
    
    const doc = typeof item.toObject === "function" ? item.toObject() : { ...item };

    // Global clean-up for default Mongoose fields
    delete doc.__v;
    delete doc._id;
    delete doc.answers; // Security cleanup for quiz attempt payloads

    // QuizAttempt specific clean-up to strip extra relational metadata safely
    if (doc.quizId && typeof doc.quizId === "object") {
      delete doc.quizId._id;
      delete doc.quizId.isAvailable;
      delete doc.quizId.totalMarks;
    }

    // Process nested quiz questions using the isolated helper function
    handleQuizQuestions(doc, isArrayMode);

    return doc;
  };

  // ⚡ CASE 1: INPUT IS AN ARRAY -> Remove redundancy for optimized listing
  if (Array.isArray(inputData)) {
    if (inputData.length === 0) return { metadata: null, data: [] };

    // 🚨 Safety check: If the first item is null, the process cannot continue.
    if (!inputData[0]) {
      throw new Error("Formatting Error: First element of the array is null or undefined!");
    }

    let commonData = null;

    // Extract common metadata safely using optional chaining everywhere
    if (commonKey && inputData[0][commonKey] && typeof inputData[0][commonKey] === "object") {
      commonData = {};
      fieldsToKeep.forEach((field) => {
        commonData[field] = inputData[0][commonKey][field];
      });
    }

    // Process all list records safely
    const cleanedList = inputData.map((item) => {
      const doc = cleanSingle(item, true); // If the item is null, cleanSingle will throw an error.
      if (commonKey && doc) delete doc[commonKey];
      return doc;
    });

    return {
      metadata: commonData,
      data: cleanedList,
    };
  }

  // ⚡ CASE 2: INPUT IS A SINGLE OBJECT -> Return direct flat structural response
  const singleDoc = cleanSingle(inputData, false);

  // Format and cleanly rename the populated object key safely
  if (singleDoc && commonKey && singleDoc[commonKey] && typeof singleDoc[commonKey] === "object") {
    const formattedCommon = {};
    fieldsToKeep.forEach((field) => {
      formattedCommon[field] = singleDoc[commonKey][field];
    });
    singleDoc[commonKey.replace("Id", "")] = formattedCommon;
    delete singleDoc[commonKey];
  }

  return singleDoc;
};