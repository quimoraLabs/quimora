/**
 * Isolated Helper: Specialized in formatting quiz questions and nested options.
 * @param {Object} doc - Plain JavaScript object from Mongoose document
 * @param {Boolean} isArrayMode - True if processing a list/loop, false for a single object
 */
const handleQuizQuestions = (doc, isArrayMode) => {
  if (!doc.questions || !Array.isArray(doc.questions)) return;

  // Case A: For array lists, reduce payload size by sending only the count
  if (isArrayMode) {
    doc.questionsCount = doc.questions.length;
    delete doc.questions;
    return;
  }

  // Case B: For single object details, retain the array but strip internal IDs
  doc.questions = doc.questions.map((q) => {
    const plainQ = typeof q.toObject === "function" ? q.toObject() : { ...q };
    
    delete plainQ._id;
    // delete plainQ.id;
    delete plainQ.__v;

    // Sanitize nested option IDs inside each question
    if (plainQ.options && Array.isArray(plainQ.options)) {
      plainQ.options = plainQ.options.map((opt) => {
        const plainOpt = typeof opt.toObject === "function" ? opt.toObject() : { ...opt };
        delete plainOpt._id;
        // delete plainOpt.id;
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
  if (!inputData) return null;

  // Core formatting block executed for every individual document
  const cleanSingle = (item, isArrayMode = false) => {
    const doc = typeof item.toObject === "function" ? item.toObject() : { ...item };

    // Global clean-up for default Mongoose fields
    delete doc.__v;
    delete doc._id;
    delete doc.answers; // Security cleanup for quiz attempt payloads

    // QuizAttempt specific clean-up to strip extra relational metadata safely
    if (doc.quizId && typeof doc.quizId === "object") {
      delete doc.quizId._id;
      // delete doc.quizId.id;
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

    let commonData = null;

    // Extract common metadata from the first item to lift it to the top-level response
    if (commonKey && inputData[0]?.[commonKey] && typeof inputData[0][commonKey] === "object") {
      commonData = {};
      fieldsToKeep.forEach((field) => {
        commonData[field] = inputData[0][commonKey][field];
      });
    }

    // Process all list records and strip the common populated key to prevent repetition
    const cleanedList = inputData.map((item) => {
      const doc = cleanSingle(item, true); // true sets array mode configuration
      if (commonKey) delete doc[commonKey];
      return doc;
    });

    return {
      metadata: commonData,
      data: cleanedList,
    };
  }

  // ⚡ CASE 2: INPUT IS A SINGLE OBJECT -> Return direct flat structural response
  const singleDoc = cleanSingle(inputData, false); // false sets single object detail mode

  // Format and cleanly rename the populated object key (e.g., 'userId' becomes 'user')
  if (commonKey && singleDoc[commonKey] && typeof singleDoc[commonKey] === "object") {
    const formattedCommon = {};
    fieldsToKeep.forEach((field) => {
      formattedCommon[field] = singleDoc[commonKey][field];
    });
    singleDoc[commonKey.replace("Id", "")] = formattedCommon;
    delete singleDoc[commonKey];
  }

  return singleDoc;
};