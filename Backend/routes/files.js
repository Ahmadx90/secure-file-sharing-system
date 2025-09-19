import express from "express";
import upload from "../middleware/upload.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getFileInfo,
  getPublicFileInfo,
  getUserFiles,
} from "../controllers/files.js";

const router = express.Router();

router.post("/upload", authenticateToken, upload.single("file"), uploadFile);
router.get("/user-files", authenticateToken, getUserFiles);
router.get("/info/:fileId", optionalAuth, getFileInfo);
router.get("/public-info/:fileId", getPublicFileInfo);
router.post("/download/:fileId", optionalAuth, downloadFile);
router.delete("/:fileId", authenticateToken, deleteFile);

export default router;
