import Course from "../Models/course.model.js";

const courseAccessMiddleware = async (req, res, next) => {
  try {
    const courseId =
      req.params.id ||
      req.params.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const userId = req.user._id || req.user.id;

    
    if (req.user.role === "Admin") {
      req.course = course;
      return next();
    }

    
    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() === userId.toString()
    ) {
      req.course = course;
      return next();
    }

    
    const isEnrolled = course.enrolled.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course",
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error("Course Access Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify course access",
    });
  }
};

export default courseAccessMiddleware;