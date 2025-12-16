import { Router } from "express";
import {
  getAllCourses,
  createCourse,
  addLecturesToCourseById,
  getLecturesByCourseId,
  updateVideoProgress,
  getVideoProgress
} from "../controllers/course.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(isLoggedIn, authorizedRoles("ADMIN", "USER"), upload.single("thumbnail"), createCourse);

router
  .route("/:courseId")
  .get(isLoggedIn, authorizedRoles("ADMIN", "USER"), getLecturesByCourseId)
  .post(isLoggedIn, authorizedRoles("ADMIN", "USER"), upload.single("file"), addLecturesToCourseById);

router
  .route("/:courseId/lectures/:lectureId/progress")
  .post(isLoggedIn, updateVideoProgress);

router
  .route("/:courseId/progress")
  .get(isLoggedIn, getVideoProgress);

export default router;


