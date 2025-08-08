import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/file.js";
import { v2 as cloudinary } from "cloudinary";

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __projectRoot = path.resolve(__dirname, "..", "..");


// THE CORRECTED CLOUDINARY UPLOAD HELPER FUNCTION
const cloudinaryUpload = async (file, folder) => {
  const options = {
    folder,
    resource_type: "auto",
  };

  // Check if a temporary file path exists. If so, upload from the path.
  if (file.tempFilePath) {
    console.log(`Uploading from temporary file path: ${file.tempFilePath}`);
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  } else {
    // If no temp file path, it means the file is in memory (as a buffer).
    // We convert the buffer to a base64 data URI to upload.
    console.log("Uploading from memory buffer. This prevents the ENOENT error.");
    
    const fileDataUri = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
    
    return await cloudinary.uploader.upload(fileDataUri, options);
  }
};



// --- Local File Upload Handler ---
export const localFileUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;
    const uploadDir = path.join(__projectRoot, "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filepath = path.join(uploadDir, filename);

    await file.mv(filepath);

    res.status(200).json({
      success: true,
      message: "File uploaded locally successfully",
      path: filepath,
    });
  } catch (error) {
    console.error("Error during local file upload:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// --- Image Upload Handler ---
const isFileTypeSupported = (fileExtension, supportedTypes) => {
  return supportedTypes.includes(fileExtension);
};

export const imageUpload = async (req, res) => {
  try {
    const { name, tags } = req.body;
    const file = req.files ? req.files.file : null;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    if (!name || !tags) {
      return res.status(400).json({ success: false, message: "Name and tags are required fields" });
    }

    const supportedTypes = ["jpg", "jpeg", "png", "gif"];
    const fileExt = path.extname(file.name).substring(1).toLowerCase();

    if (!isFileTypeSupported(fileExt, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: `File type not supported. Please use one of: ${supportedTypes.join(", ")}`,
      });
    }

    console.log("Uploading file to Cloudinary...");
    const cloudinaryResponse = await cloudinaryUpload(file, "Temp");
    console.log("File uploaded successfully to Cloudinary:", cloudinaryResponse.secure_url);

    const fileData = await File.create({
      name,
      tags,
      imageUrl: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
    });

    res.status(200).json({
      success: true,
      message: "Image successfully uploaded and data saved",
      data: fileData,
    });
  } catch (error) {
    console.error("Error during image upload:", error);
    res.status(500).json({ success: false, message: "Something went wrong during image upload" });
  }
};