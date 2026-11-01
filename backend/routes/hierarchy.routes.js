import express from "express";
import { hierarchyController } from "../controllers/hierarchy.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public/student authenticated discovery of 4-level hierarchy
router.use(authMiddleware, authorizeRoles("user", "instructor", "admin"));

// Level 1: Root Domains
router.get("/domains", hierarchyController.getDomains);
router.post("/domains/ensure", hierarchyController.ensureDomain);

// Level 2: Courses under Domain
router.get("/domains/:domainId/courses", hierarchyController.getCoursesByDomain);

// Level 3: Chapters under Course
router.get("/courses/:courseId", hierarchyController.getCourseDetails);

// Level 4: Quizzes under Chapter
router.get("/chapters/:chapterId/quizzes", hierarchyController.getQuizzesByChapter);

// Complete Hierarchical Drill-down for a Course (Course -> Chapters -> Quizzes)
router.get("/courses/:courseId/hierarchy", hierarchyController.getCourseHierarchy);

export default router;

