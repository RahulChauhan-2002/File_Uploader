import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const localFileUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;
    const uploadDir = path.join(__dirname, "file");

    // ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.name);
    const filename = Date.now() + fileExt;
    const filepath = path.join(uploadDir, filename);

    file.mv(filepath, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "File upload failed" });
      }
      res.json({
        success: true,
        message: "File uploaded successfully",
        path: filepath,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
