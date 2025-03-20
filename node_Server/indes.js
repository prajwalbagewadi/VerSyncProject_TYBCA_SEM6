const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Repository = require("./models/Repo");
const Users = require("./models/Users");
const { error } = require("console");
const mime = require("mime");
const bcrypt = require("bcrypt");
const { exec } = require("child_process");
const { useState } = require("react");

let reqpaths = []; // Stores extracted paths from request body

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors()); // Allow all origins
app.options("*", cors());

const [repoNameSet] = useState([]);

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Users")
  .then(() => console.log("Connected to MongoDB 🥭"))
  .catch((err) => console.error("MongoDB Connection Error ❌", err));

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields Required" });
    }
    const existUser = await Users.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already Registered." });
    }
    const hashedpass = await bcrypt.hash(password, 10);
    const newUser = new Users({
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

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await Users.findOne({ email });
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

// ✅ Ensure "uploads" directory exists
const uploadsDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// ✅ Multer Storage Configuration
const storageDynamic = multer.diskStorage({
  destination: (req, file, cb) => {
    paths = req.body.description.split(",");
    console.log("multer:paths:", paths);
    const repoName = req.body.name ? req.body.name.trim() : "default_repo";
    repoNameSet = repoName;
    let uploadPath = path.join(uploadsDirectory, repoName);

    exec(
      ` node "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\Dir_change_tracker_with_log.js" "${uploadPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          //res.status(500).json({ error: "Failed to execute script" });
        }
        if (stderr) {
          console.error(`Script stderr: ${stderr}`);
        }
        console.log(`Script output: ${stdout}`);
        //res.json({ message: "Directory tracking started successfully!" });
      }
    );

    // Ensure main directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // ✅ Extract subdirectory from the paths array
    if (typeof paths === "string") {
      paths = JSON.parse(paths);
    }
    paths = Array.isArray(paths) ? paths : [];

    // Store extracted paths globally for debugging
    reqpaths = paths;
    console.log("Multer: Received Paths:", paths);

    // ✅ Get the file index to find the correct subdirectory
    const fileIndex = req.files ? req.files.length : 0;
    const subPath = paths[fileIndex] ? path.dirname(paths[fileIndex]) : "";

    // ✅ Create full directory path
    const fullDirPath = path.join(uploadPath, subPath);
    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
    }

    cb(null, fullDirPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storageDynamic }).array("files", 50);

// ✅ Repository Creation & File Upload API
app.post("/api/repos", upload, async (req, res) => {
  try {
    console.log("Received Repo:", req.body.name, req.body.description);

    let paths = req.body.paths;
    if (typeof paths === "string") {
      paths = JSON.parse(paths);
    }
    paths = Array.isArray(paths) ? paths : [];
    console.log("Parsed Paths:", paths);
    reqpaths = [...paths];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // ✅ Ensure files are stored with correct subdirectory paths
    const files = req.files.map((file, index) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: path.join(req.body.name, paths[index] || file.filename),
    }));

    const newRepo = new Repository({
      name: req.body.name.trim(),
      description: req.body.description[0] || "No description",
      paths,
      files,
    });

    await newRepo.save();

    return res.status(201).json({
      message: "Repository created & files uploaded successfully!",
      repo: newRepo,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/subfolders/*", (req, res) => {
  const requestedPath = path.join(uploadsDirectory, req.params[0] || ""); // Capture entire dynamic path

  console.log("📂 Fetching subfolders for:", requestedPath);

  if (!fs.existsSync(requestedPath)) {
    console.error("❌ Folder not found:", requestedPath);
    return res.status(404).json({ error: "Folder not found" });
  }

  try {
    const items = fs.readdirSync(requestedPath, { withFileTypes: true });

    const subfolders = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    const files = items
      .filter((item) => item.isFile())
      .map((item) => item.name);

    res.json({ subfolders, files });
  } catch (error) {
    console.error("❌ Error reading directory:", error);
    res.status(500).json({ error: "Failed to read directory" });
  }
});

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

app.get("/repositories", async (req, res) => {
  try {
    const repos = await Repository.find();
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/open-file/*", (req, res) => {
  const filePath = decodeURIComponent(req.params[0]);
  const sanitizedFilePath = filePath.replace(/^https?:\/\/[^\/]+\/file\//, "");
  const absolutePath = path.normalize(
    path.join(uploadsDirectory, sanitizedFilePath)
  );

  console.log("📂 Requested file:", absolutePath);

  if (!absolutePath.startsWith(uploadsDirectory)) {
    console.error("❌ Access denied:", absolutePath);
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(absolutePath)) {
    console.error("❌ File not found:", absolutePath);
    return res.status(404).json({ error: "File not found" });
  }

  const contentType = mime.lookup(absolutePath) || "application/octet-stream";
  res.setHeader("Content-Type", contentType);

  if (contentType.startsWith("text/") || contentType === "application/json") {
    fs.readFile(absolutePath, "utf8", (err, data) => {
      if (err) {
        console.error("❌ Error reading file:", err);
        return res.status(500).json({ error: "Error reading file" });
      }
      res.json({ content: data, fileType: contentType });
    });
  } else {
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  }
});

app.post("/save-file", async (req, res) => {
  let { filePath, content } = req.body;

  if (!filePath || !content) {
    console.error("❌ Invalid request data:", req.body);
    return res.status(400).json({ error: "Invalid request data" });
  }

  // ✅ Remove `http://localhost:3000/file/` from the path if present
  filePath = filePath.replace(/^https?:\/\/[^\/]+\/file\//, "");

  const absolutePath = path.join(uploadsDirectory, filePath);

  console.log("📂 Requested filePath (sanitized):", filePath);
  console.log("📂 Absolute Path:", absolutePath);

  // ✅ Security check: Prevent directory traversal
  if (!absolutePath.startsWith(uploadsDirectory)) {
    console.error("❌ Access denied for:", absolutePath);
    return res.status(403).json({ error: "Access denied" });
  }

  // ✅ Ensure the directory exists before writing the file
  const fileDir = path.dirname(absolutePath);
  if (!fs.existsSync(fileDir)) {
    console.log("📁 Creating missing directories:", fileDir);
    fs.mkdirSync(fileDir, { recursive: true });
  }

  try {
    await fs.promises.writeFile(absolutePath, content, "utf8");
    console.log("✅ File saved successfully at:", absolutePath);
    res.json({ message: "File saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving file:", err.message, err.stack);
    res.status(500).json({ error: `Error saving file: ${err.message}` });
  }
});

const router = express.Router();

router.put("/rename-folder", (req, res) => {
  const { currentPath, newName } = req.body;
  const basePath = "./your-folder-path"; // Adjust this

  const oldFolderPath = path.join(basePath, currentPath);
  const newFolderPath = path.join(basePath, path.dirname(currentPath), newName);

  if (!fs.existsSync(oldFolderPath)) {
    return res.status(404).json({ error: "Folder not found" });
  }

  try {
    fs.renameSync(oldFolderPath, newFolderPath);
    res.json({
      message: "Folder renamed successfully",
      newPath: newFolderPath,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to rename folder" });
  }
});

module.exports = router;

// Rename endpoint
app.post("/api/rename", (req, res) => {
  const oldPath = path.join(__dirname, "uploads", req.body.oldPath);
  const newPath = path.join(__dirname, "uploads", req.body.newPath);
  console.log("oldPath=", oldPath);
  console.log("newPath=", newPath);
  if (!oldPath || !newPath) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Check if the file/folder exists
  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: "File/Folder not found" });
  }

  // Check if the target name already exists
  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: "Target name already exists" });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error renaming file/folder." });
    }
    res.json({ success: true, message: "Renamed successfully!" });
  });
  const repoName = req.body.name ? req.body.name.trim() : "default_repo";
  let uploadPath = path.join(uploadsDirectory, repoName);
});

const port = 3000;
app.listen(port, () =>
  console.log(`Prajwal🥭📂 Server running on 🚀 port ${port}`)
);
