import uploadToCloudinary from "./uploadToCloudinary.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const uploadProfileImage = async (fileBuffer, options = {}) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("File is required");
  }

  const mimeType = options.mimeType || "image/jpeg";

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error("Only image files are allowed");
  }

  const result = await uploadToCloudinary(fileBuffer, {
    folder: "lms/profiles",
    mimeType,
    originalName: options.originalName || "profile-image",
  });

  return {
    url: result.url,
    publicId: result.publicId,
  };
};

export default uploadProfileImage;
