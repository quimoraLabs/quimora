import EloRating from "../models/eloRating.model.js";
import Question from "../models/question.model.js";

const K_FACTOR = 32;

export class EloEngineService {
  /**
   * Calculate expected score given student Elo and question Elo
   * E_S = 1 / (1 + 10^((R_Q - R_S) / 400))
   */
  static calculateExpectedScore(studentElo, questionElo) {
    return 1 / (1 + Math.pow(10, (questionElo - studentElo) / 400));
  }

  /**
   * Calculate new ratings post response
   * S = 1 for correct, 0 for incorrect
   */
  static calculateNewRatings(studentElo, questionElo, score) {
    const expected = this.calculateExpectedScore(studentElo, questionElo);

    const newStudentElo = Math.max(
      0,
      Math.round(studentElo + K_FACTOR * (score - expected))
    );

    const newQuestionElo = Math.max(
      100,
      Math.round(questionElo + K_FACTOR * (expected - score))
    );

    return {
      newStudentElo,
      newQuestionElo,
      expectedScore: expected,
    };
  }

  /**
   * Process Elo adjustments after a question response in a quiz attempt
   */
  static async updateEloAfterResponse(
    studentId,
    interestId,
    questionId,
    isCorrect,
    options = {}
  ) {
    const session = options.session || null;
    const score = isCorrect ? 1 : 0;

    // Fetch or initialize EloRating record for student & interest
    let eloRecord = await EloRating.findOne({
      studentId,
      interestId,
      isArchived: false,
    }).session(session);

    if (!eloRecord) {
      eloRecord = await EloRating.findOneAndUpdate(
        { studentId, interestId },
        {
          $setOnInsert: {
            rating: 1000,
            highestRating: 1000,
            quizzesAttempted: 0,
            isArchived: false,
          },
        },
        { upsert: true, returnDocument: 'after', session }
      );
    }

    // Fetch question
    const question = await Question.findById(questionId).session(session);
    const questionElo = question?.eloRating || 1200;
    const studentElo = eloRecord.rating;

    // Calculate updated Elo values
    const { newStudentElo, newQuestionElo } = this.calculateNewRatings(
      studentElo,
      questionElo,
      score
    );

    // Update EloRating
    const newHighest = Math.max(eloRecord.highestRating, newStudentElo);
    eloRecord.rating = newStudentElo;
    eloRecord.highestRating = newHighest;
    eloRecord.quizzesAttempted += 1;
    eloRecord.lastUpdated = new Date();
    await eloRecord.save({ session });

    // Update Question eloRating
    if (question) {
      question.eloRating = newQuestionElo;
      await question.save({ session });
    }

    return {
      oldStudentElo: studentElo,
      newStudentElo,
      oldQuestionElo: questionElo,
      newQuestionElo,
      highestRating: newHighest,
    };
  }
}

export default EloEngineService;
