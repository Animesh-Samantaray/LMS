import Course from "../Models/course.model.js";
import Unit from "../Models/Unit.model.js";
import Lesson from "../Models/Lesson.model.js";

// Helper for authorization
const isAuthorized = async (courseId, req) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: "Course not found", status: 404 };

  const isAdmin = req.user.role === "Admin";
  const isOwner = course.createdBy.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    return { error: "You are not authorized to modify this course", status: 403 };
  }
  return { course };
};

// ==============================
// UNITS
// ==============================

export const createUnit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const auth = await isAuthorized(courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    // Determine order
    const lastUnit = await Unit.findOne({ courseId }).sort("-order");
    const order = lastUnit ? lastUnit.order + 1 : 1;

    const unit = await Unit.create({
      courseId,
      title: title.trim(),
      description: description?.trim() || "",
      order,
    });

    return res.status(201).json({ success: true, message: "Unit created successfully", unit });
  } catch (error) {
    console.error("Create Unit Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create unit" });
  }
};

export const getCourseUnits = async (req, res) => {
  try {
    const { courseId } = req.params;

    const units = await Unit.find({ courseId }).sort("order");
    
    // Fetch lessons for each unit
    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await Lesson.find({ unitId: unit._id }).sort("order");
        return { ...unit.toObject(), lessons };
      })
    );

    return res.status(200).json({ success: true, units: unitsWithLessons });
  } catch (error) {
    console.error("Get Course Units Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch units" });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    if (title !== undefined) unit.title = title.trim();
    if (description !== undefined) unit.description = description.trim();

    await unit.save();

    return res.status(200).json({ success: true, message: "Unit updated successfully", unit });
  } catch (error) {
    console.error("Update Unit Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update unit" });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    // Delete associated lessons
    await Lesson.deleteMany({ unitId });
    await Unit.findByIdAndDelete(unitId);

    return res.status(200).json({ success: true, message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Delete Unit Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete unit" });
  }
};

export const reorderUnits = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { unitIds } = req.body; // array of ordered unit IDs

    if (!Array.isArray(unitIds)) {
      return res.status(400).json({ success: false, message: "Invalid payload format" });
    }

    const auth = await isAuthorized(courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    const updates = unitIds.map((id, index) =>
      Unit.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);

    return res.status(200).json({ success: true, message: "Units reordered successfully" });
  } catch (error) {
    console.error("Reorder Units Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reorder units" });
  }
};


// ==============================
// LESSONS
// ==============================

export const createLesson = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description, contentType, videoUrl, pdfUrl, externalUrl, duration } = req.body;

    if (!title || !contentType) {
      return res.status(400).json({ success: false, message: "Title and content type are required" });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    const lastLesson = await Lesson.findOne({ unitId }).sort("-order");
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create({
      unitId,
      title: title.trim(),
      description: description?.trim() || "",
      order,
      contentType,
      videoUrl: videoUrl?.trim() || "",
      pdfUrl: pdfUrl?.trim() || "",
      externalUrl: externalUrl?.trim() || "",
      duration: Number(duration) || 0,
    });

    return res.status(201).json({ success: true, message: "Lesson created successfully", lesson });
  } catch (error) {
    console.error("Create Lesson Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create lesson" });
  }
};

export const getUnitLessons = async (req, res) => {
  try {
    const { unitId } = req.params;
    const lessons = await Lesson.find({ unitId }).sort("order");
    return res.status(200).json({ success: true, lessons });
  } catch (error) {
    console.error("Get Unit Lessons Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch lessons" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, contentType, videoUrl, pdfUrl, externalUrl, duration } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const unit = await Unit.findById(lesson.unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    if (title !== undefined) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description.trim();
    if (contentType !== undefined) lesson.contentType = contentType;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl.trim();
    if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl.trim();
    if (externalUrl !== undefined) lesson.externalUrl = externalUrl.trim();
    if (duration !== undefined) lesson.duration = Number(duration) || 0;

    await lesson.save();

    return res.status(200).json({ success: true, message: "Lesson updated successfully", lesson });
  } catch (error) {
    console.error("Update Lesson Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update lesson" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const unit = await Unit.findById(lesson.unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    await Lesson.findByIdAndDelete(lessonId);

    return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete Lesson Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete lesson" });
  }
};

export const reorderLessons = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { lessonIds } = req.body;

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ success: false, message: "Invalid payload format" });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const auth = await isAuthorized(unit.courseId, req);
    if (auth.error) return res.status(auth.status).json({ success: false, message: auth.error });

    const updates = lessonIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);

    return res.status(200).json({ success: true, message: "Lessons reordered successfully" });
  } catch (error) {
    console.error("Reorder Lessons Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reorder lessons" });
  }
};
