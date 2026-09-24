import Progress from "../Models/Progress.model.js";

// @route   GET /api/courses/:id/progress
// @desc    Get current user's progress for a course
export const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = await Progress.create({ userId, courseId, completedLessons: [] });
    }

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ success: false, message: "Server error fetching progress." });
  }
};

// @route   POST /api/courses/:id/lessons/:lessonId/complete
// @desc    Toggle completion status of a lesson
export const toggleLessonCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({ userId, courseId, completedLessons: [] });
    }

    const lessonIndex = progress.completedLessons.findIndex(
      (id) => id.toString() === lessonId.toString()
    );
    let isCompleted = false;

    if (lessonIndex > -1) {
      // Already completed, so we remove it (toggle off)
      progress.completedLessons.splice(lessonIndex, 1);
    } else {
      // Not completed, add it (toggle on)
      progress.completedLessons.push(lessonId);
      isCompleted = true;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: isCompleted ? "Lesson marked as completed" : "Lesson marked as incomplete",
      progress,
      isCompleted
    });
  } catch (error) {
    console.error("Error toggling lesson completion:", error);
    res.status(500).json({ success: false, message: "Server error updating progress." });
  }
};
