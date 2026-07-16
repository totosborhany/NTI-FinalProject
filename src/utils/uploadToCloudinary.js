import { imagekit } from "../config/cloudinary.js"; // swap this import path to your config file

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file.buffer, // Buffer uploaded directly
      fileName: file.originalname || "attachment",
      folder: "/nti-project"
    }, (error, result) => {
      if (error) {
        console.error("ImageKit Upload Error:", error);
        return reject(error);
      }
      
      // Map ImageKit's response to align with your existing Schema keys
      resolve({
        secure_url: result.url,
        public_id: result.fileId,       // Maps to publicId in Schema
        resource_type: result.fileType, // "image" or "non-image" (we use file.mimetype for DB validation)
        bytes: result.size              // Maps to size in Schema
      });
    });
  });
};