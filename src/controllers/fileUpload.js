import fs from "fs/promises"; // Using the promise-based version of fs
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/file.js"; // Your Mongoose model
import { v2 as cloudinary } from "cloudinary";

// --- Path Setup ---
// Correctly determine the project's root directory to place the 'uploads' folder
const __filename = fileURLToPath(import.meta.url); // -> /path/to/project/src/controllers/fileUpload.js
const __dirname = path.dirname(__filename); // -> /path/to/project/src/controllers
const __projectRoot = path.resolve(__dirname, "..", ".."); // -> /path/to/project

// --- Cloudinary Upload Helper ---
// This helper function is well-defined and can be reused.
const cloudinaryUpload = async (file, folder) => {
  const options = {
    folder,
    resource_type: "auto", // Automatically detect file type (image, video, etc.)
  };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};

// --- Local File Upload Handler ---
export const localFileUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;
    // Define the upload directory at the project root, not inside the src folder
    const uploadDir = path.join(__projectRoot, "uploads");

    // Ensure the directory exists using the async version of mkdir
    await fs.mkdir(uploadDir, { recursive: true });

    // Create a more unique filename to prevent collisions
    const fileExt = path.extname(file.name);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filepath = path.join(uploadDir, filename);

    // Use await on file.mv(). The outer try...catch will now handle errors correctly.
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

// Helper function to check for supported file types
const isFileTypeSupported = (fileExtension, supportedTypes) => {
  return supportedTypes.includes(fileExtension);
};

export const imageUpload = async (req, res) => {
  try {
    // 1. Get required data from the request
    const { name, tags } = req.body; // Only get data the client should provide
    const file = req.files ? req.files.file : null;

    // 2. Perform validation
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    if (!name || !tags) {
      return res.status(400).json({ success: false, message: "Name and tags are required fields" });
    }

    // 3. Validate file type
    const supportedTypes = ["jpg", "jpeg", "png", "gif"];
    const fileExt = path.extname(file.name).substring(1).toLowerCase();

    if (!isFileTypeSupported(fileExt, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: `File type not supported. Please use one of: ${supportedTypes.join(", ")}`,
      });
    }

    // 4. Upload to Cloudinary
    // The second argument to cloudinaryUpload is the folder name on Cloudinary
    console.log("Uploading file to Cloudinary...");
    const cloudinaryResponse = await cloudinaryUpload(file, "Temp");
    console.log("File uploaded successfully to Cloudinary:", cloudinaryResponse.secure_url);

    // 5. Save the metadata to the database
    const fileData = await File.create({
      name,
      tags,
      imageUrl: cloudinaryResponse.secure_url, // Use the URL from the Cloudinary response
      publicId: cloudinaryResponse.public_id, // Also good to save the public_id for future edits/deletes
    });

    // 6. Send a success response with the database record
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