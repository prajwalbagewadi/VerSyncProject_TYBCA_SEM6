const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storageDynamic = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.body.username || "default_user"; // Default if no username provided
    const userDir = path.join(__dirname, "uploads", username);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadDynamic = multer({ storage: storageDynamic });

// ✅ Upload Route
app.post("/upload-dynamic", uploadDynamic.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({ message: "File uploaded successfully!", file: req.file });
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
