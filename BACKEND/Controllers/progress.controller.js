import Progress from "../Models/Progress.model.js";
import Unit from "../Models/Unit.model.js";
import Lesson from "../Models/Lesson.model.js";

export const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const courseId = req.params.id;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedLessons: [],
      });
    }

    const units = await Unit.find({ courseId }).sort("order");
    const courseLessons = await Lesson.find({
      unitId: { $in: units.map((unit) => unit._id) },
    }).sort("order");

    const completedLessonIds = progress.completedLessons.map((id) =>
      id.toString()
    );

    const totalLessons = courseLessons.length;
    const completedLessons = courseLessons.filter((lesson) =>
      completedLessonIds.includes(lesson._id.toString())
    ).length;
    const percentage =
      totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    const unitsWithProgress = units.map((unit, index) => {
      const unitLessons = courseLessons.filter(
        (lesson) => lesson.unitId.toString() === unit._id.toString()
      );

      const completed =
        unitLessons.length > 0 &&
        unitLessons.every((lesson) =>
          completedLessonIds.includes(lesson._id.toString())
        );

      let unlocked = true;

      if (index > 0) {
        const previousUnit = units[index - 1];
        const previousUnitLessons = courseLessons.filter(
          (lesson) => lesson.unitId.toString() === previousUnit._id.toString()
        );
        const previousUnitCompleted =
          previousUnitLessons.length > 0 &&
          previousUnitLessons.every((lesson) =>
            completedLessonIds.includes(lesson._id.toString())
          );

        unlocked = previousUnitCompleted;
      }

      return {
        _id: unit._id,
        title: unit.title,
        description: unit.description,
        order: unit.order,
        completed,
        unlocked,
      };
    });

    const courseCompleted =
      totalLessons > 0 && completedLessons === totalLessons;

    return res.status(200).json({
      success: true,
      progress: {
        completedLessonIds: progress.completedLessons,
        totalLessons,
        completedLessons,
        percentage,
      },
      units: unitsWithProgress,
      courseCompleted,
    });
  } catch (error) {
    console.error("Get Course Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error fetching progress.",
    });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const unit = await Unit.findById(lesson.unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    if (unit.courseId.toString() !== courseId.toString()) {
      return res.status(403).json({
        success: false,
        message: "This lesson does not belong to this course",
      });
    }

    const units = await Unit.find({ courseId }).sort("order");
    const currentUnitIndex = units.findIndex(
      (unitItem) => unitItem._id.toString() === unit._id.toString()
    );

    if (currentUnitIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Unit does not belong to this course",
      });
    }

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedLessons: [],
      });
    }

    const alreadyCompleted = progress.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: "Lesson is already completed",
      });
    }

    if (currentUnitIndex > 0) {
      const previousUnit = units[currentUnitIndex - 1];
      const previousUnitLessons = await Lesson.find({ unitId: previousUnit._id }).sort("order");
      const previousUnitCompleted =
        previousUnitLessons.length > 0 &&
        previousUnitLessons.every((previousLesson) =>
          progress.completedLessons.some(
            (id) => id.toString() === previousLesson._id.toString()
          )
        );

      if (!previousUnitCompleted) {
        return res.status(403).json({
          success: false,
          message: "Complete the previous unit before accessing this lesson",
        });
      }
    }

    progress.completedLessons.push(lesson._id);
    await progress.save();

    const currentUnitLessons = await Lesson.find({ unitId: unit._id }).sort("order");
    const unitCompleted =
      currentUnitLessons.length > 0 &&
      currentUnitLessons.every((currentLesson) =>
        progress.completedLessons.some(
          (id) => id.toString() === currentLesson._id.toString()
        )
      );

    const allCourseLessons = await Lesson.find({
      unitId: { $in: units.map((unitItem) => unitItem._id) },
    }).sort("order");

    const completedLessonsCount = allCourseLessons.filter((courseLesson) =>
      progress.completedLessons.some(
        (id) => id.toString() === courseLesson._id.toString()
      )
    ).length;

    const totalLessons = allCourseLessons.length;
    const percentage =
      totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100);
    const courseCompleted =
      totalLessons > 0 && completedLessonsCount === totalLessons;

    let nextUnitUnlocked = false;
    let nextUnitId = null;

    if (unitCompleted && currentUnitIndex < units.length - 1) {
      nextUnitUnlocked = true;
      nextUnitId = units[currentUnitIndex + 1]._id;
    }

    return res.status(200).json({
      success: true,
      message: "Lesson completed successfully",
      data: {
        lessonCompleted: true,
        unitCompleted,
        courseCompleted,
        nextUnitUnlocked,
        nextUnitId,
        progress: {
          completedLessons: completedLessonsCount,
          totalLessons,
          percentage,
        },
      },
    });
  } catch (error) {
    console.error("Complete Lesson Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error completing lesson.",
    });
  }
};