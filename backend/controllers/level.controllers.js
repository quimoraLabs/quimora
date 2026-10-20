import LevelMappingService from "../services/levelMapping.service.js";
import StudentProfileService from "../services/studentProfile.service.js";

/**
 * @desc    Get all level tier definitions (Beginner -> Expert)
 * @route   GET /api/v2/levels
 * @access  Public
 */
export const getAllLevels = async (req, res, next) => {
  try {
    const levels = await LevelMappingService.getAllLevels();
    res.status(200).json({
      success: true,
      count: levels.length,
      data: levels,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current student's level tier per interest
 * @route   GET /api/v2/levels/student
 * @access  Private (Student)
 */
export const getStudentLevels = async (req, res, next) => {
  try {
    const { profile, eloRatings } = await StudentProfileService.getStudentProfile(req.auth.userId);

    const levelsWithElo = await Promise.all(
      eloRatings.map(async (ratingDoc) => {
        const level = await LevelMappingService.getLevelForElo(ratingDoc.rating);
        return {
          interest: ratingDoc.interestId,
          rating: ratingDoc.rating,
          highestRating: ratingDoc.highestRating,
          quizzesAttempted: ratingDoc.quizzesAttempted,
          level: {
            levelName: level.levelName,
            badge: level.badge,
            minElo: level.minElo,
            maxElo: level.maxElo,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        profile,
        levels: levelsWithElo,
      },
    });
  } catch (err) {
    next(err);
  }
};
