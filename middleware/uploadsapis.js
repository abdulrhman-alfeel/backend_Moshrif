const fs = require("fs").promises; // Use promises for non-blocking I/O
const multer = require("multer");
const path = require("path");
const storages = multer.diskStorage({
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
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}${path.extname(file.originalname)}`;
  
    await cb(null, uniqueFileName);
  },
});

const uploadsapis = multer({ storage: storages });
module.exports = uploadsapis;
