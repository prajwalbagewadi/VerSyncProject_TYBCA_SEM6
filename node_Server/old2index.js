const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/Users");
const Repository = require("./models/1Repo");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Users")
  .then(() => console.log("Connected to MongoDB ✅"))
  .catch((err) => console.error("MongoDB Connection Error ❌", err));

// **Uploads Directory Setup**
const uploadsDirectory = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// **Multer Storage Configuration**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const repoName = req.params.repoName; // ✅ Get repoName from URL params
    if (!repoName) {
      return cb(new Error("Repository name is required"), false);
    }

    const uploadPath = path.join(uploadsDirectory, repoName);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    if (!file) {
      return cb(new Error("No file provided"), false);
    }
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// **User Signup API**
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedpass = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedpass });
    await newUser.save();

    console.log("New user registered:", newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("☠️ Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// **User Login API**
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      return res.status(200).json(user);
    } else {
      return res.status(400).json({ message: "Invalid password" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// **Create Repository API**
app.post("/api/repos", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Repo name is required" });

    const repoExist = await Repository.findOne({ name });
    if (repoExist) {
      return res.status(400).json({ error: "Repo already exists" });
    }

    const newRepo = new Repository({ name, description });
    await newRepo.save();

    const repoPath = path.join(uploadsDirectory, name);
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }

    res.status(200).json({ message: "Repository created!", repo: newRepo });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// **Upload Files to a Specific Repository**
app.post(
  "/api/repos/:repoName/upload",
  upload.array("files", 50),
  (req, res) => {
    try {
      const repoName = req.params.repoName; // ✅ Use URL params
      console.log("Files uploaded to repo:", repoName);

      if (!repoName) {
        return res.status(400).json({ message: "Repository name is required" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      res
        .status(200)
        .json({ message: "Files uploaded successfully", files: req.files });
    } catch (err) {
      console.error("Error uploading files:", err);
      res.status(500).json({ message: "Error uploading files" });
    }
  }
);

// Start the Server
const port = 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
