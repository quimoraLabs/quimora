import trackProgressionService from "../services/trackProgression.service.js";

/**
 * Controller exposing track progression and sequential unlocking endpoints.
 */
class TrackProgressionController {
  /**
   * GET /api/v2/student/tracks/:interestId
   * Returns domain track details, chapters, quizzes, unlock status, and star rating.
   */
  async getDomainTrack(req, res, next) {
    try {
      const { interestId } = req.params;
      const userId = req.auth?.userId || req.user?.id || req.user?._id;

      const track = await trackProgressionService.getDomainTrack(interestId, userId);
      return res.status(200).json({
        success: true,
        data: track,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v2/student/tracks/next-challenge/:quizId
   * Resolves the next challenge in sequence after completing current quiz.
   */
  async getNextChallenge(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.auth?.userId || req.user?.id || req.user?._id;

      const nextChallenge = await trackProgressionService.getNextChallenge(quizId, userId);
      return res.status(200).json({
        success: true,
        data: nextChallenge,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const trackProgressionController = new TrackProgressionController();
export default trackProgressionController;
