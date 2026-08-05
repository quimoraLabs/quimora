import { fetchInstructorDashboardData } from "../services/instructorDashboard.service.js";

/**
 * Express Controller to retrieve instructor dashboard analytics feed.
 */
export const getInstructorDashboard = async (req, res, next) => {
  try {
     const userId = req.auth.userId.toString();

    const dashboardPayload = await fetchInstructorDashboardData(userId);

    return res.status(200).json({
      success: true,
      message: "Instructor dashboard data retrieved successfully",
      data: dashboardPayload,
    });
  } catch (error) {
    next(error);
  }
};
