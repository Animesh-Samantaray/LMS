import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import uploadProfileImage from "../Utils/uploadProfileImage.js";

const profileFields = [
  "bio", "phone", "dateOfBirth", "location", "education",
  "interests", "skills", "learningGoals", "socialLinks",
];

const findStudentProfile = async (id) => {
  const profile = await StudentProfile.findOne({ user: id }).populate(
    "user", "name email profileImage role"
  );

  if (profile) return profile;

  return StudentProfile.findById(id).populate(
    "user", "name email profileImage role"
  );
};

export const getStudentProfile = async (req, res) => {
  try {
    const profile = await findStudentProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    return res.status(200).json({
      success: true,
      profile,
      user: profile.user,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.name !== undefined) user.name = String(req.body.name).trim();
    if (req.body.email !== undefined) user.email = String(req.body.email).trim().toLowerCase();
    await user.save();

    profileFields.forEach((field) => {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    });
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      profile: await StudentProfile.findById(profile._id).populate(
        "user", "name email profileImage role"
      ),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const profiles = await StudentProfile.find().populate(
      "user", "name email profileImage role"
    );
    return res.status(200).json({ success: true, profiles });
  } catch (error) {
    console.error("Get All Students Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const profile = await findStudentProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get Student By ID Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndDelete({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    return res.status(200).json({ success: true, message: "Student profile deleted successfully" });
  } catch (error) {
    console.error("Delete Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const uploadStudentProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile image is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const result = await uploadProfileImage(req.file.buffer, {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    user.profileImage = result.url;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Upload Student Profile Image Error:", error);
    return res.status(500).json({ success: false, message: "Unable to upload profile image" });
  }
};