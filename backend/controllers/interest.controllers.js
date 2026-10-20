import Interest from "../models/interest.model.js";
import StudentProfileService from "../services/studentProfile.service.js";

/**
 * @desc    Get all active interests
 * @route   GET /api/v2/interests
 * @access  Public
 */
export const getInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({ isActive: true }).sort({ isCore: -1, name: 1 });
    res.status(200).json({
      success: true,
      count: interests.length,
      data: interests,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current student profile with interests and Elo ratings
 * @route   GET /api/v2/interests/student/profile or /api/v2/student/profile
 * @access  Private (Student)
 */
export const getStudentProfile = async (req, res, next) => {
  try {
    const profileData = await StudentProfileService.getStudentProfile(req.auth.userId);
    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Complete initial student onboarding with 5-6 interests
 * @route   POST /api/v2/interests/student/onboarding or /api/v2/student/interests/onboarding
 * @access  Private (Student)
 */
export const completeStudentOnboarding = async (req, res, next) => {
  try {
    const { interestIds } = req.body;
    if (!interestIds || !Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: "interestIds array is required",
      });
    }

    const profile = await StudentProfileService.completeOnboarding(
      req.auth.userId,
      interestIds
    );

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Update student interests post-onboarding (up to 10)
 * @route   PUT /api/v2/interests/student/interests or /api/v2/student/interests
 * @access  Private (Student)
 */
export const updateStudentInterests = async (req, res, next) => {
  try {
    const { interestIds } = req.body;
    if (!interestIds || !Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: "interestIds array is required",
      });
    }

    const profile = await StudentProfileService.updateInterests(
      req.auth.userId,
      interestIds
    );

    res.status(200).json({
      success: true,
      message: "Student interests updated successfully",
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
