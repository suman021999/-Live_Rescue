//cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
//uploadLiveRescuerImage 
dotenv.config();

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadLiveRescuerImage  = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null;

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "live_images",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            return reject(new Error("Image upload failed"));
          }
          resolve(result.secure_url);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  } catch (error) {
    console.error("❌ Upload function error:", error);
    throw error;
  }
};

// ✅ Export the main instance if needed elsewhere
export default cloudinary;
