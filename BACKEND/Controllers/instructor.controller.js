import User from "../Models/User.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";
import uploadProfileImage from "../Utils/uploadProfileImage.js";

const profileFields = [
  "bio", "phone", "location", "expertise", "qualification",
  "experience", "designation", "socialLinks",
];

const findInstructorProfile = async (id) => {
  const profile = await InstructorProfile.findOne({ user: id }).populate(
    "user", "name email profileImage role"
  );
  if (profile) return profile;
  return InstructorProfile.findById(id).populate(
    "user", "name email profileImage role"
  );
};

export const getInstructorProfile = async (req, res) => {
  try {
    const profile = await findInstructorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Instructor profile not found" });
    }
    return res.status(200).json({
      success: true,
      profile,
      user: profile.user,
    });
  } catch (error) {
    console.error("Get Instructor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateInstructorProfile = async (req, res) => {
  try {
    const profile = await InstructorProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Instructor profile not found" });
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
      message: "Instructor profile updated successfully",
      profile: await InstructorProfile.findById(profile._id).populate(
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
    console.error("Update Instructor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllInstructors = async (req, res) => {
  try {
    const profiles = await InstructorProfile.find().populate(
      "user", "name email profileImage role"
    );
    return res.status(200).json({ success: true, profiles });
  } catch (error) {
    console.error("Get All Instructors Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getInstructorById = async (req, res) => {
  try {
    const profile = await findInstructorProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Instructor profile not found" });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get Instructor By ID Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteInstructorProfile = async (req, res) => {
  try {
    const profile = await InstructorProfile.findOneAndDelete({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Instructor profile not found" });
    }
    return res.status(200).json({ success: true, message: "Instructor profile deleted successfully" });
  } catch (error) {
    console.error("Delete Instructor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const uploadInstructorProfileImage = async (req, res) => {
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
    console.error("Upload Instructor Profile Image Error:", error);
    return res.status(500).json({ success: false, message: "Unable to upload profile image" });
  }
};