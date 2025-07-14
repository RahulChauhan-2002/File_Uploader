import express from "express";
import { imageUpload, videoUpload, imageSizeReducer, localFileUpload } from "../controllers/fileUpload.js";

const router = express.Router();

router.post("/imageUpload", imageUpload);
router.post("/videoUpload", videoUpload);
router.post("/sizeBreak", imageSizeReducer);
router.post("/localServerUpload", localFileUpload);

export default router;
