import cloudinary from "../Configs/cloudinary.js";

const normalizeFileName = (originalName = "file") => {
  const safeBase = String(originalName)
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9_-]+/g, "_") || "file";

  return safeBase.slice(0, 120) || "file";
};

const getExtension = (originalName = "") => {
  const extension = String(originalName).split(".").pop();
  return extension ? extension.toLowerCase() : "";
};

const getResourceType = (mimeType = "") => {
  if (!mimeType) return "raw";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
};

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("File is required");
  }

  const mimeType = options.mimeType || "application/octet-stream";
  const resourceType = getResourceType(mimeType);
  const folder = options.folder || "lms/uploads";
  const originalName = options.originalName || "file";
  const extension = getExtension(originalName);
  const safeBase = normalizeFileName(originalName);
  
  // For raw files (PDFs, DOCX, ZIP, etc.), including the extension in the public_id ensures
  // Cloudinary generates a direct download/view URL with the file extension intact
  const publicIdWithExt = extension
    ? `${safeBase}_${Date.now()}.${extension}`
    : `${safeBase}_${Date.now()}`;

  const uploadOptions = {
    folder,
    resource_type: resourceType,
    public_id: resourceType === "raw" ? publicIdWithExt : `${safeBase}_${Date.now()}`,
    use_filename: false,
    unique_filename: false,
  };

  if (resourceType === "raw" && extension) {
    uploadOptions.format = extension;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(uploadResult);
        }
      );

      stream.end(fileBuffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format || extension || null,
      originalName: originalName || null,
    };
  } catch (error) {
    throw new Error(error?.message || "File upload failed");
  }
};

export default uploadToCloudinary;
