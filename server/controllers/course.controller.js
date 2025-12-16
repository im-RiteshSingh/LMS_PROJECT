import AppError from "../utils/appError.js";
import Course from "../models/course.model.js";



// getAllCourses
//getLecturesByCourseId
// CreateCourse
// update course
// delete course
// addLecturestocourseByid

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
