import AppError from "../utils/appError.js";
import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import VideoProgress from "../models/videoProgress.js";

// getAllCourses
//getLecturesByCourseId
// CreateCourse
// update course
// ... (existing code) ...

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
      return next(new AppError("All fields are required", 400));
    }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy: req.user.id,
      instructor: createdBy,
      thumbnail: {
        public_id: "DUMMY",
        secure_url: "Dummy",
      },
    });

    if (req.file) {
      console.log("Uploading file to Cloudinary:", req.file.path);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }
        await fs.unlink(req.file.path);
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        // Clean up local file even if upload fails
        await fs.unlink(req.file.path).catch(() => { });
        return next(new AppError(500, "File upload failed"));
      }
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(500, error.message || "Course creation failed"));
  }
};

export const addLecturesToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { courseId } = req.params;

    if (!title || !description) {
      return next(new AppError(400, "All fields are required"));
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError(400, "Course does not exist"));
    }

    const lectureData = {
      title,
      description,
      lecture: {},
    };

    if (req.file) {
      console.log("Uploading lecture to Cloudinary:", req.file.path);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms',
          resource_type: "video"
        });

        if (result) {
          console.log("Cloudinary Upload Success. Result:", result.public_id);
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        } else {
          console.error("Cloudinary Upload Failed: No result returned");
        }

        await fs.unlink(req.file.path);
      } catch (error) {
        console.error("Cloudinary Lecture Upload Error:", error);
        await fs.unlink(req.file.path).catch(() => { });
        return next(new AppError(500, "Lecture upload failed"));
      }
    }

    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;

    console.log("Saving course with new lecture:", JSON.stringify(lectureData, null, 2));

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added succesfully",
      course,
    });
  } catch (error) {
    console.error("Add Lecture Error:", error);
    return next(new AppError(500, error.message));
  }
};

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

export const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError(404, "Course not found"));
    }

    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};

export const updateVideoProgress = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;
    const { lastWatchedTime, duration, completed } = req.body;
    const userId = req.user.id; // Assuming auth middleware adds user to req

    const progress = await VideoProgress.findOneAndUpdate(
      { userId, courseId, lectureId },
      {
        userId,
        courseId,
        lectureId,
        lastWatchedTime,
        duration,
        completed
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Progress updated",
      progress
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};

export const getVideoProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progressData = await VideoProgress.find({ userId, courseId });

    res.status(200).json({
      success: true,
      message: "Course progress fetched",
      progressData
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};
