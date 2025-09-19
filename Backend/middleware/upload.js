// New code (created as per tree; was missing code)
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1000MB limit
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(new Error("No file provided"), false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
