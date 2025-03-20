const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Repository = require("./models/Repo");
const Users = require("./models/Users");
const File = require("./models/File");
const { error } = require("console");
const mime = require("mime");
const bcrypt = require("bcrypt");
const { exec } = require("child_process");
const { useState } = require("react");

let reqpaths = []; // Stores extracted paths from request body

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     allowedHeaders: ["Content-Type", "Authorization", "multipart/form-data"],
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );
app.use(cors()); // Allow all origins
app.options("*", cors());

let repoNameSet;

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

// ✅ Middleware to log request details
// const logger = (req, res, next) => {
//   let paths = [];
//   try {
//     if (req.headers["content-type"]?.includes(multipart / form - data)) {
//       if (req.body.paths) {
//         paths = JSON.parse(req.body.paths);
//       }
//     } else {
//       paths = req.body.paths;
//     }
//   } catch (err) {
//     console.error("error in parsing Req.body.paths in logger");
//   }
//   req.extractedPaths = Array.isArray(paths) ? paths : [];
//   console.log("extracted logger paths:", req.extractedPaths);
//   next();
// };

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
    exec(
      ` node "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js" "${uploadPath}"`,
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
    // startTracker(uploadsDirectory);
    // startTracker2(uploadsDirectory);

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

// app.get("/subfolder", (req, res) => {
//   fs.readdir(uploadsDirectory, { withFileTypes: true }, (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     const subdirectory = files
//       .filter((file = file.isDirectory()))
//       .map((file) => file.name);
//     res.json({ subdirectory });
//   });
// });

// app.get("/subfolders/:repoName", (req, res) => {
//   const { repoName } = req.params;
//   const repoPath = path.join(uploadsDirectory, repoName);

//   if (!fs.existsSync(repoPath)) {
//     return res.status(404).json({ error: "Repository not found" });
//   }

//   fs.readdir(repoPath, { withFileTypes: true }, (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // ✅ Filter only directories (subfolders)
//     const subfolders = files
//       .filter((file) => file.isDirectory()) // ✅ Corrected filter syntax
//       .map((file) => file.name);

//     res.json({ subfolders });
//   });
// });

// function getFilesAndFolders(directory) {
//   let results = [];

//   try {
//     const files = fs.readdirSync(directory);

//     files.forEach((file) => {
//       const fullPath = path.join(directory, file);
//       const stats = fs.statSync(fullPath);

//       if (stats.isDirectory()) {
//         results.push({
//           name: file,
//           type: "folder",
//           path: fullPath,
//           children: getFilesAndFolders(fullPath),
//         });
//       } else {
//         results.push({ name: file, type: "file", path: fullPath });
//       }
//     });
//   } catch (error) {
//     console.error(`Error reading directory: ${error.message}`);
//   }

//   return results;
// }

// API Route to get repository files
// app.get("/list-files/:repoName", (req, res) => {
//   const repoPath = req.query.path; // Get repo path from query parameter

//   if (!repoPath) {
//     return res.status(400).json({ error: "Missing 'path' query parameter" });
//   }

//   if (!fs.existsSync(repoPath)) {
//     return res.status(404).json({ error: "Repository not found" });
//   }

//   const fileTree = getFilesAndFolders(repoPath);
//   res.json({ repository: repoPath, files: fileTree });
// });
// app.get("/list-files/:repoName", (req, res) => {
//   try {
//     const repoName = req.params.repoName;
//     const repoPath = path.join(__dirname, "uploads", repoName); // Ensuring access within "uploads"

//     if (!fs.existsSync(repoPath)) {
//       return res.status(404).json({ error: "Repository not found" });
//     }

//     const fileTree = getFilesAndFolders(repoPath);
//     res.json({ repository: repoName, files: fileTree });
//   } catch (error) {
//     console.error("Error fetching repository files:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/subfolders/:repoName", (req, res) => {
//   console.log("subfolders api.");
//   const { repoName } = req.params;
//   const repoPath = path.join(uploadsDirectory, repoName);

//   fs.readdir(repoPath, { withFileTypes: true }, (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     const subfolders = files
//       .filter((file) => file.isDirectory())
//       .map((file) => file.name);

//     res.json({ subfolders });
//   });
// });

// app.get("/subfolders/:repoName", (req, res) => {
//   console.log("📂 Fetching subfolders for:", req.params.repoName);

//   const { repoName } = req.params;
//   const repoPath = path.join(uploadsDirectory, repoName);

//   // ✅ Check if repo exists
//   if (!fs.existsSync(repoPath)) {
//     console.error("❌ Repository not found:", repoPath);
//     return res.status(404).json({ error: "Repository not found" });
//   }

//   // ✅ Read subfolders safely
//   fs.readdir(repoPath, { withFileTypes: true }, (err, files) => {
//     if (err) {
//       console.error("❌ Error reading directory:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     const subfolders = files
//       .filter((file) => file.isDirectory())
//       .map((file) => file.name);

//     console.log("✅ Found subfolders:", subfolders);
//     res.json({ subfolders });
//   });
// });

// app.get("/subfolders/:repoName/:subfolder?", (req, res) => {
//   console.log(
//     "📂 Fetching subfolders for:",
//     req.params.repoName,
//     req.params.subfolder || "root"
//   );

//   const { repoName, subfolder } = req.params;
//   let folderPath = path.join(uploadsDirectory, repoName);

//   if (subfolder) {
//     folderPath = path.join(folderPath, subfolder);
//   }

//   if (!fs.existsSync(folderPath)) {
//     console.error("❌ Folder not found:", folderPath);
//     return res.status(404).json({ error: "Folder not found" });
//   }

//   fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
//     if (err) {
//       console.error("❌ Error reading directory:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     const subfolders = files
//       .filter((file) => file.isDirectory())
//       .map((file) => file.name);

//     const regularFiles = files
//       .filter((file) => file.isFile()) // ✅ Check if it's a file
//       .map((file) => file.name);
//     res.json({ subfolders, files: regularFiles });
//   });
// });

// app.get("/subfolder/:path(*)", (req, res) => {
//   const requestedPath = path.join(BASE_DIR, req.params.path);

//   if (!fs.existsSync(requestedPath)) {
//     return res.status(404).json({ error: "Path not found" });
//   }

//   try {
//     const items = fs.readdirSync(requestedPath, { withFileTypes: true });

//     const subfolders = items
//       .filter((item) => item.isDirectory())
//       .map((item) => item.name);
//     const files = items
//       .filter((item) => item.isFile())
//       .map((item) => item.name);

//     res.json({ subfolders, files });
//   } catch (error) {
//     console.error("Error reading directory:", error);
//     res.status(500).json({ error: "Failed to read directory" });
//   }
// });

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

// app.get("/file/*", (req, res) => {
//   const filePath = path.join(uploadsDirectory, req.params[0]);

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: "File not found" });
//   }

//   try {
//     const content = fs.readFileSync(filePath, "utf8");
//     res.json({ content });
//   } catch (error) {
//     res.status(500).json({ error: "Error reading file" });
//   }
// });

// Save file changes
// app.put("/file/*", (req, res) => {
//   const filePath = path.join(uploadsDirectory, req.params[0]);
//   const { content } = req.body;

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: "File not found" });
//   }

//   try {
//     fs.writeFileSync(filePath, content, "utf8");
//     res.json({ message: "File saved successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Error saving file" });
//   }
// });

// ✅ Start the Server

// app.get("/file/*", (req, res) => {
//   const filePath = decodeURIComponent(req.params[0]); // ✅ Decode before using
//   const absolutePath = path.join(uploadsDirectory, filePath);

//   if (!fs.existsSync(absolutePath)) {
//     return res.status(404).json({ error: "File not found" });
//   }

//   res.sendFile(absolutePath);
// });

// const BASE_DIR = "/absolute/path/to/uploads"; // Set your actual upload directory
// const filePath = path.join(
//   BASE_DIR,
//   "rn1/testData/tcs/1740147055987_PRAJWALBAGEWADI_ApplicationForm (3).pdf"
// );

// console.log("Checking file:", filePath);
// console.log("Exists?", fs.existsSync(filePath));

// app.get("/file/*", (req, res) => {
//   const filePath = decodeURIComponent(req.params[0]); // ✅ Decode URL

//   console.log("📂 Requested file path:", filePath);

//   const absolutePath = path.join(uploadsDirectory, filePath);
//   console.log("📂 Absolute path:", absolutePath);

//   if (!fs.existsSync(absolutePath)) {
//     console.error("❌ File not found:", absolutePath);
//     return res.status(404).json({ error: "File not found" });
//   }

//   res.sendFile(absolutePath);
// });

// app.get("/file/*", (req, res) => {
//   // Decode URL to handle spaces and special characters
//   const filePath = decodeURIComponent(req.params[0]);
//   console.log("📂 Requested file path:", filePath);

//   // Prevent directory traversal attack by resolving the path
//   const absolutePath = path.normalize(path.join(uploadsDirectory, filePath));
//   console.log("📂 Absolute path:", absolutePath);

//   // Check if the requested file is inside the uploads directory
//   if (!absolutePath.startsWith(uploadsDirectory)) {
//     console.error("❌ Access denied:", absolutePath);
//     return res.status(403).json({ error: "Access denied" });
//   }

//   // Check if file exists
//   if (!fs.existsSync(absolutePath)) {
//     console.error("❌ File not found:", absolutePath);
//     return res.status(404).json({ error: "File not found" });
//   }

//   // Set Content-Type based on file extension
//   const mime = require("mime-types"); // Ensure `mime-types` is installed
//   const contentType = mime.lookup(absolutePath) || "application/octet-stream";

//   res.setHeader("Content-Type", contentType);
//   res.sendFile(absolutePath);
// });

// app.get("/open-file/*", (req, res) => {
//   const filePath = decodeURIComponent(req.params[0]); // Handle special characters
//   const sanitizedFilePath = filePath.replace(/^https?:\/\/[^\/]+\/file\//, "");

//   const absolutePath = path.normalize(
//     path.join(uploadsDirectory, sanitizedFilePath)
//   );

//   console.log("📂 Requested file:", absolutePath);

//   // ✅ Security: Prevent directory traversal attack
//   if (!absolutePath.startsWith(uploadsDirectory)) {
//     console.error("❌ Access denied:", absolutePath);
//     return res.status(403).json({ error: "Access denied" });
//   }

//   // ✅ Check if file exists
//   if (!fs.existsSync(absolutePath)) {
//     console.error("❌ File not found:", absolutePath);
//     return res.status(404).json({ error: "File not found" });
//   }

//   // ✅ Determine file type
//   const contentType = mime.lookup(absolutePath) || "application/octet-stream";

//   // ✅ For text-based files, return content
//   if (contentType.startsWith("text/") || contentType === "application/json") {
//     fs.readFile(absolutePath, "utf8", (err, data) => {
//       if (err) {
//         console.error("❌ Error reading file:", err);
//         return res.status(500).json({ error: "Error reading file" });
//       }
//       res.json({ content: data, fileType: contentType });
//     });
//   } else {
//     // ✅ For other file types, stream the file
//     res.setHeader("Content-Type", contentType);
//     const fileStream = fs.createReadStream(absolutePath);
//     fileStream.pipe(res);
//   }
// });

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

// app.post("/save-file", async (req, res) => {
//   const { filePath, content } = req.body;

//   if (!filePath || !content) {
//     return res.status(400).json({ error: "Invalid request data" });
//   }

//   const absolutePath = path.join(uploadsDirectory, filePath);

//   // ✅ Security check: Prevent directory traversal
//   if (!absolutePath.startsWith(uploadsDirectory)) {
//     return res.status(403).json({ error: "Access denied" });
//   }

//   try {
//     await fs.promises.writeFile(absolutePath, content, "utf8");
//     console.log("✅ File saved:", absolutePath);
//     res.json({ message: "File saved successfully!" });
//   } catch (err) {
//     console.error("❌ Error saving file:", err);
//     res.status(500).json({ error: "Error saving file" });
//   }
// });

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

    console.log("Write successful!");

    // Call /api/start-tracker with the new path
    // startTracker(uploadsDirectory, res);
    // startTracker(uploadsDirectory);
    // startTracker2(uploadsDirectory);

    // exec(
    //   ` node "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\Dir_change_tracker_with_log.js" "${uploadsDirectory}"`,
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Error executing script: ${error.message}`);
    //       //res.status(500).json({ error: "Failed to execute script" });
    //     }
    //     if (stderr) {
    //       console.error(`Script stderr: ${stderr}`);
    //     }
    //     console.log(`Script output: ${stdout}`);
    //     //res.json({ message: "Directory tracking started successfully!" });
    //   }
    // );
    // exec(
    //   ` node  --max-old-space-size=4096 "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js" "${uploadsDirectory}"`,
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Error executing script: ${error.message}`);
    //       //res.status(500).json({ error: "Failed to execute script" });
    //     }
    //     if (stderr) {
    //       console.error(`Script stderr: ${stderr}`);
    //     }
    //     console.log(`Script output: ${stdout}`);
    //     //res.json({ message: "Directory tracking started successfully!" });
    //   }
    // );

    exec(
      `node --max-old-space-size=4096 "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js" "${absolutePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error executing script: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`⚠️ Script stderr: ${stderr}`);
        }
        console.log(`📜 Script output: ${stdout}`);
      }
    );

    // .then(() => res.json({ message: "File saved and tracking started!" }))
    // .catch((err) =>
    //   res.status(500).json({ error: `Error starting tracker: ${err}` })
    // );
  } catch (err) {
    console.error("❌ Error saving file:", err.message, err.stack);
    res.status(500).json({ error: `Error saving file: ${err.message}` });
  }
});

// const express = require("express");
// const fs = require("fs");
// const path = require("path");

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
// app.post("/api/rename", (req, res) => {
//   //const { oldPath, newPath } = req.body;
//   //let oldpath = req.body?.oldpath || "";
//   //let newPath = req.body?.newPath || "";

//   const oldPath = path.join(__dirname, "uploads", req.body.oldPath);
//   const newPath = path.join(__dirname, "uploads", req.body.newPath);
//   console.log("oldPath=", oldPath);
//   console.log("newPath=", newPath);
//   if (!oldPath || !newPath) {
//     return res.status(400).json({ error: "Missing required fields." });
//   }

//   // Check if the file/folder exists
//   if (!fs.existsSync(oldPath)) {
//     return res.status(404).json({ error: "File/Folder not found" });
//   }

//   // Check if the target name already exists
//   if (fs.existsSync(newPath)) {
//     return res.status(400).json({ error: "Target name already exists" });
//   }

//   // const fullOldPath = path.join(uploadsDirectory, oldPath);
//   // const fullNewPath = path.join(uploadsDirectory, newPath);
//   // console.log("fullOldPath=", fullOldPath);
//   // console.log("fullNewPath=", fullNewPath);

//   fs.rename(oldPath, newPath, (err) => {
//     if (err) {
//       return res.status(500).json({ error: "Error renaming file/folder." });
//     }
//     res.json({ success: true, message: "Renamed successfully!" });
//   });
//   const repoName = req.body.name ? req.body.name.trim() : "default_repo";
//   let uploadPath = path.join(uploadsDirectory, repoName);
// });
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

    console.log("Rename successful!");

    // Call /api/start-tracker with the new path
    // startTracker(uploadsDirectory, res);
    // startTracker(uploadsDirectory);
    // startTracker2(uploadsDirectory);

    exec(
      ` node "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\Dir_change_tracker_with_log.js" "${uploadsDirectory}"`,
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
    // exec(
    //   ` node "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js" "${uploadsDirectory}"`,
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Error executing script: ${error.message}`);
    //       //res.status(500).json({ error: "Failed to execute script" });
    //     }
    //     if (stderr) {
    //       console.error(`Script stderr: ${stderr}`);
    //     }
    //     console.log(`Script output: ${stdout}`);
    //     //res.json({ message: "Directory tracking started successfully!" });
    //   }
    // );

    // .then(() =>
    //   res.json({ message: "Rename successful and tracking started!" })
    // )
    // .catch((err) =>
    //   res.status(500).json({ error: `Error starting tracker: ${err}` })
    // );
  });
});

function startTracker2(uploadPath) {
  const scriptPath2 = `"C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js"`;

  exec(`node ${scriptPath2} "${uploadPath}"`, (error, stdout1, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ error: "Failed to execute script" });
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }

    console.log(`Script output: ${stdout1}`);
    res.json({
      message: "write successful and file tracking started!",
      output: stdout1,
    });
  });
}

function startTracker(uploadPath) {
  const scriptPath = `"C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\Dir_change_tracker_with_log.js"`;

  exec(`node ${scriptPath} "${uploadPath}"`, (error, stdout1, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ error: "Failed to execute script" });
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }

    console.log(`Script output: ${stdout1}`);
    res.json({
      message: "Rename successful and directory tracking started!",
      output: stdout1,
    });
  });
}

// function startTracker(uploadPath) {
//   const scriptPath1 = `"C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\Dir_change_tracker_with_log.js"`;
//   const scriptPath2 = `"C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\public\\filetracker.js"`;

//   // Function to execute a script and return a promise
//   function executeScript(scriptPath) {
//     return new Promise((resolve, reject) => {
//       exec(`node ${scriptPath} "${uploadPath}"`, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`Error executing ${scriptPath}: ${error.message}`);
//           reject({ error: `Failed to execute ${scriptPath}` });
//         } else {
//           if (stderr) console.error(`Script stderr: ${stderr}`);
//           console.log(`Script output: ${stdout}`);
//           resolve(stdout);
//         }
//       });
//     });
//   }

//   // Run both scripts concurrently and respond after both finish
//   Promise.all([executeScript(scriptPath1), executeScript(scriptPath2)])
//     .then((outputs) => {
//       res.json({
//         message: "Rename successful and tracking started!",
//         outputs, // Both script outputs
//       });
//     })
//     .catch((err) => {
//       res.status(500).json(err);
//     });
// }

// 📌 Get File with Comments & Tags
// router.get("/file/:fileName", async (req, res) => {
//   try {
//     const file = await File.findOne({
//       fileName: decodeURIComponent(req.params.fileName),
//     });
//     if (!file) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }
//     res.json({ success: true, comments: file.comments, tags: file.tags });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// 📌 ADD File with Comments & Tags
// Add Tag & Comment API
// router.post("/file/add", async (req, res) => {
//   try {
//     const { fileName, tag, comment, user } = req.body;

//     if (!fileName) {
//       return res.status(400).json({ success: false, message: "File name is required" });
//     }
//     if (!tag && !comment) {
//       return res.status(400).json({ success: false, message: "Tag or Comment is required" });
//     }

//     const decodedFileName = decodeURIComponent(fileName);
//     console.log("🔹 Processing File:", decodedFileName);

//     // Find the file
//     const file = await File.findOne({ fileName: decodedFileName });
//     if (!file) {
//       return res.status(404).json({ success: false, message: "File not found" });
//     }

//     let updateFields = {};
//     if (tag) {
//       updateFields.$addToSet = { tags: tag }; // Prevent duplicate tags
//     }
//     if (comment) {
//       updateFields.$push = { comments: { text: comment, user: user || "Anonymous" } };
//     }

//     // Update file with new tag/comment
//     const updatedFile = await File.findOneAndUpdate(
//       { fileName: decodedFileName },
//       updateFields,
//       { new: true }
//     );

//     res.json({
//       success: true,
//       message: tag && comment ? "Tag and Comment added" : tag ? "Tag added" : "Comment added",
//       tags: updatedFile.tags,
//       comments: updatedFile.comments,
//     });

//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });

// Add Tag & Comment API
// router.post("/file/add", async (req, res) => {
//   try {
//     const { fileName, tag, comment, user } = req.body;

//     if (!fileName) {
//       return res
//         .status(400)
//         .json({ success: false, message: "File name is required" });
//     }
//     if (!tag && !comment) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Tag or Comment is required" });
//     }

//     const decodedFileName = decodeURIComponent(fileName);
//     console.log("🔹 Processing File:", decodedFileName);

//     // Find the file
//     const file = await File.findOne({ fileName: decodedFileName });
//     if (!file) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     let updateFields = {};
//     if (tag) {
//       updateFields.$addToSet = { tags: tag }; // Prevent duplicate tags
//     }
//     if (comment) {
//       updateFields.$push = {
//         comments: { text: comment, user: user || "Anonymous" },
//       };
//     }

//     // Update file with new tag/comment
//     const updatedFile = await File.findOneAndUpdate(
//       { fileName: decodedFileName },
//       updateFields,
//       { new: true }
//     );

//     res.json({
//       success: true,
//       message:
//         tag && comment
//           ? "Tag and Comment added"
//           : tag
//           ? "Tag added"
//           : "Comment added",
//       tags: updatedFile.tags,
//       comments: updatedFile.comments,
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
// router.post("/file/add", async (req, res) => {
//   try {
//     const { fileName, tag, comment, user } = req.body;

//     if (!fileName) {
//       return res
//         .status(400)
//         .json({ success: false, message: "File name is required" });
//     }

//     const decodedFileName = decodeURIComponent(fileName);
//     console.log("Processing file:", decodedFileName);

//     const file = await File.findOne({ fileName: decodedFileName });
//     if (!file) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     let updateFields = {};
//     if (tag) updateFields.$addToSet = { tags: tag };
//     if (comment)
//       updateFields.$push = {
//         comments: { text: comment, user: user || "Anonymous" },
//       };

//     const updatedFile = await File.findOneAndUpdate(
//       { fileName: decodedFileName },
//       updateFields,
//       { new: true }
//     );

//     res.json({
//       success: true,
//       message:
//         tag && comment
//           ? "Tag and Comment added"
//           : tag
//           ? "Tag added"
//           : "Comment added",
//       tags: updatedFile.tags,
//       comments: updatedFile.comments,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
// Add a tag or comment to a file
// Route to add a tag and/or comment to a file
// 1️⃣ Route: Fetch Comments & Tags for a File
// app.get("/file/:fileName", async (req, res) => {
//   try {
//     const { fileName } = req.params;
//     const file = await File.findOne({ fileName });

//     if (!file) {
//       return res.status(404).json({
//         success: false,
//         message: "File not found",
//         comments: [],
//         tags: [],
//       });
//     }

//     res.json({
//       success: true,
//       comments: file.comments,
//       tags: file.tags,
//     });
//   } catch (error) {
//     console.error("Error fetching file data:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
router.get("/file/:fileName", async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName); // Decode URL encoding
    console.log("Fetching file:", fileName);

    const file = await File.findOne({ fileName });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.json({
      success: true,
      fileName: file.fileName,
      comments: file.comments,
      tags: file.tags,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 2️⃣ Route: Add a Tag and/or Comment
app.post("/file/add", async (req, res) => {
  try {
    const { fileName, tag, comment, user } = req.body;

    if (!fileName) {
      return res
        .status(400)
        .json({ success: false, message: "File name is required" });
    }

    console.log("Processing file:", fileName);

    let updateFields = {};
    if (tag) {
      updateFields.$addToSet = { tags: tag }; // Ensures unique tags
    }
    if (comment) {
      updateFields.$push = {
        comments: { text: comment, user: user || "Anonymous" },
      };
    }

    // Use upsert: true to create a new file entry if it doesn't exist
    const updatedFile = await File.findOneAndUpdate(
      { fileName },
      updateFields,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message:
        tag && comment
          ? "Tag and Comment added"
          : tag
          ? "Tag added"
          : "Comment added",
      tags: updatedFile.tags,
      comments: updatedFile.comments,
    });
  } catch (error) {
    console.error("Error adding tag or comment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const port = 3000;
app.listen(port, () =>
  console.log(`Prajwal🥭📂 Server running on 🚀 port ${port}`)
);
