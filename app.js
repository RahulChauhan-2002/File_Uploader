import express from "express";
import dbConnect from "./scr/config/dbConnect.js";
import fileUpload from "express-fileupload";
import cloudinaryConnect from "./scr/config/cloudinary.js";
import fileUploadRoute from "./scr/routes/fileUploadRoute.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(fileUpload());

app.use("/api/v1", fileUploadRoute);

const startServer = async () => {
  try {
    await dbConnect();
    cloudinaryConnect();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
