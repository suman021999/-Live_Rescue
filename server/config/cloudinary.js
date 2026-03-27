//cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadAuctionImage = async (fileBuffer, mimetype) => {
  try {
    if (!fileBuffer) return null;

    // Convert buffer to base64 Data URI
    const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "live_images",
      resource_type: "image",
    });

    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary auction image upload error:", error);
    throw new Error("Auction image upload failed");
  }
};

// ✅ Export the main instance if needed elsewhere
export default cloudinary;
