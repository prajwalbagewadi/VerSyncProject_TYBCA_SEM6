const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/Users"); //model imported
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

//dbinterface
mongoose
  .connect("mongodb://localhost:27017/Users")
  .then(() => console.log("Connected to mongodb 🥭"))
  .catch((err) => console.log("mongodb not Connected Error 👾"));

//Api
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields Required" });
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already Registered." });
    }
    const hashedpass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedpass,
    });
    await newUser.save();
    console.log("new user Registered:", newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log("☠️ error registering user:", err);
    res.status(500).json({ message: "internal Server Error" });
  }
});

// Define the base directory for uploads relative to the current script directory
const uploadsDirectory = path.join(
  __dirname,
  "notesApp",
  "node_Server",
  "uploads"
);

// Ensure the upload directory exists
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Configure multer for file uploads
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const repoName = req.body.repoName;

    if (!repoName) {
      return cb(new Error("Repository name is required"), false);
    }
    const uploadPath = path.join(uploadsDirectory, repoName); // Dynamic path to each repo's directory
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the repository directory exists
    }

    cb(null, uploadPath); // Set the directory path for multer to store the file
  },
  filename: (req, file, cb) => {
    if (!file) {
      return cb(new Error("No file provided"), false);
    }
    cb(null, Date.now() + "_" + file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: Storage });

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
    console.log("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Repository creation and upload functionality
app.post("/api/repos", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Repo name is required" });

    const repoExist = await Repository.findOne({ name });
    if (repoExist)
      return res.status(400).json({ error: "Repo already exists" });

    const newRepo = new Repository({ name, description });
    await newRepo.save();

    const repoPath = path.join(uploadsDirectory, name); // Path for the new repository
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true }); // Create the repository directory
    }

    res.status(200).json({ message: "Repository created!", repo: newRepo });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// File upload route for repositories
app.post("/api/repos/:repoName/upload", upload.array("files"), (req, res) => {
  try {
    const repoName = req.params.repoName;
    console.log("files to be uploaded=", req.files);
    console.log("Files uploaded to repo:", repoName);
    if (!repoName) {
      return res.status(400).json({ message: "Repository name is required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    console.log("Files uploaded to repo:", repoName, req.files);
    res.status(200).json({ message: "Files uploaded successfully" });
  } catch (err) {
    console.log("Error uploading files:", err);
    res.status(500).json({ message: "Error uploading files" });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Prajwal. Server Running on port ${port}`));
