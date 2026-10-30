import challengeService from "../services/challenge.service.js";

/**
 * Controller exposing live challenges and leaderboard endpoints.
 */
class ChallengeController {
  /**
   * GET /api/v2/student/challenges
   */
  async getLiveChallenges(req, res, next) {
    try {
      const challenges = await challengeService.getLiveChallenges();
      return res.status(200).json({
        success: true,
        data: challenges,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v2/student/challenges/:challengeId/leaderboard
   */
  async getChallengeLeaderboard(req, res, next) {
    try {
      const { challengeId } = req.params;
      const data = await challengeService.getChallengeLeaderboard(challengeId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const challengeController = new ChallengeController();
export default challengeController;

