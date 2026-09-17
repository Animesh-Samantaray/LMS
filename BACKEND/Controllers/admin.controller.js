import User from "../Models/User.model.js";
import uploadProfileImage from "../Utils/uploadProfileImage.js";

const userFields = "name email profileImage role accountStatus authProvider createdAt";

export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(userFields);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.body.name !== undefined) user.name = String(req.body.name).trim();
    if (req.body.email !== undefined) user.email = String(req.body.email).trim().toLowerCase();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      user: await User.findById(user._id).select(userFields),
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(userFields);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(userFields);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.body.name !== undefined) user.name = String(req.body.name).trim();
    if (req.body.email !== undefined) user.email = String(req.body.email).trim().toLowerCase();
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.accountStatus !== undefined) user.accountStatus = req.body.accountStatus;
    await user.save();

    return res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Update User Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const uploadAdminProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Profile image is required" });

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
    console.error("Upload Admin Profile Image Error:", error);
    return res.status(500).json({ success: false, message: "Unable to upload profile image" });
  }
};