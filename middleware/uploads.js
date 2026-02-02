const fs = require("fs").promises; // Use promises for non-blocking I/O
const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const baseDir = "upload/";

    try {
      // Check if directory exists, create if it doesn't
      await fs.access(baseDir);
    } catch (error) {
      if (error.code === "ENOENT") {
        // Directory doesn't exist, create it
        await fs.mkdir(baseDir, { recursive: true });
      } else {
        // Other errors
        return cb(error);
      }
    }

    cb(null, baseDir);
  },
  filename:async function (req, file, cb) {
    await cb(null, file.originalname);
  },
});

// Configure multer
const uploads = multer({
  storage: storage,
  // limits: {
  //   fileSize: 100 * 1024 * 1024, // Limit file size to 100MB
  // },
});

// Error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer errors (e.g., file size exceeded)
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ error: "Internal server error" });
  }
  next();
};

module.exports = { uploads, handleUploadErrors };