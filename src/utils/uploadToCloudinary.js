import { imagekit } from "../config/cloudinary.js"; // swap this import path to your config file

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file.buffer, 
      fileName: file.originalname || "attachment",
      folder: "/nti-project"
    }, (error, result) => {
      if (error) {
        console.error("ImageKit Upload Error:", error);
        return reject(error);
      }
      
     
      resolve({
        secure_url: result.url,
        public_id: result.fileId,       
        resource_type: result.fileType, 
        bytes: result.size              
      });
    });
  });
};