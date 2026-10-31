import practiceEngineService from "../services/practiceEngine.service.js";

/**
 * Controller handling separated Practice Engine endpoints:
 * Mode 1 (Random Mind-Game), Mode 2 (Custom Daily Target + Midnight Reset), and Scoreboard.
 */
class PracticeController {
  /**
   * GET /api/v2/practice/status
   */
  async getStatus(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      const status = await practiceEngineService.getPracticeStatus(userId);
      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v2/practice/custom-target
   */
  async setCustomDailyTarget(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      const { target } = req.body;
      const result = await practiceEngineService.setCustomDailyTarget(userId, target);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v2/practice/mode1/start
   * Starts Mode 1: Random Mind-Game
   */
  async startRandomMindGame(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      const { domainId } = req.body || {};
      const session = await practiceEngineService.startRandomMindGame(userId, { domainId });
      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v2/practice/mode2/start
   * Starts Mode 2: Custom Daily Practice Drill
   */
  async startCustomDrill(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      const { scopeType, targetName, domainName } = req.body;
      const session = await practiceEngineService.startCustomDrill(userId, {
        scopeType,
        targetName,
        domainName,
      });
      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v2/practice/submit
   * Submits answers and gets instant diagnostic feedback
   */
  async submitSession(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      const { sessionId, answers, timeSpentSeconds } = req.body;
      const result = await practiceEngineService.submitPracticeSession(userId, {
        sessionId,
        answers,
        timeSpentSeconds,
      });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const practiceController = new PracticeController();
export default practiceController;

