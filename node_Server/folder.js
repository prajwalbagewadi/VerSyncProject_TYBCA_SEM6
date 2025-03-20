const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Repository = require("./models/Repo");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "multipart/form-data"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Users")
  .then(() => console.log("Connected to MongoDB ✅"))
  .catch((err) => console.error("MongoDB Connection Error ❌", err));

// ✅ Ensure "uploads" directory exists
const uploadsDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// ✅ Function to Extract Unique Directories
function extractDirs(paths) {
  console.log("Received paths:", paths, "Type:", typeof paths);
  if (!paths) return [];
  if (typeof paths === "string") {
    try {
      paths = JSON.parse(paths); // Convert JSON string to array if applicable
    } catch (error) {
      paths = [paths]; // If parsing fails, wrap the string in an array
    }
  }

  if (!Array.isArray(paths) || paths.length === 0) {
    console.warn("extractDirs: No valid paths provided", paths);
    return [];
  }

  const uniqueDirs = new Set();
  paths.forEach((filePath) => {
    if (typeof filePath === "string") {
      const cleanPath = filePath.replace(/^["\\]+|["\\]+$/g, ""); // Remove unwanted quotes
      const dirs = cleanPath.split("/").slice(0, -1); // Remove last part (file name)
      if (dirs.length > 0) uniqueDirs.add(dirs.join("/"));
    } else {
      console.warn("Skipping invalid path:", filePath);
    }
  });

  return Array.from(uniqueDirs);
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const repoName = req.body.name ? req.body.name.trim() : "default_repo";
    const extractedDirs = extractDirs(req.body["paths"] || []);

    let uploadPath = path.join(uploadsDirectory, repoName);

    if (extractedDirs.length > 0) {
      extractedDirs.forEach((subDir) => {
        const fullPath = path.join(uploadPath, subDir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      });
    }

    // Ensure the final directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Repository Creation & File Upload API
app.post("/api/repos", upload.array("files", 50), async (req, res) => {
  try {
    const { name, description, paths } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Repo name is required" });
    }

    console.log("Received paths:", paths);
    const extractedPaths = extractDirs(paths || []);
    console.log("Unique Directories:", extractedPaths);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // ✅ Save to Database
    const files = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
    }));

    const newRepo = new Repository({ name: name.trim(), description, files });
    await newRepo.save();

    return res.status(201).json({
      message: "Repository created & files uploaded successfully!",
      repo: newRepo,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ Start the Server
const port = 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
