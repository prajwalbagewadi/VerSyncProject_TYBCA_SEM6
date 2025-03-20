// import fs from "fs";
// import path from "path";

// const dirPath = process.argv[2];

// if (!dirPath) {
//   console.error("❌ Error: No directory path provided.");
//   process.exit(1);
// }

// // ✅ Log File Path
// const logFilePath = path.join(dirPath, "codeFile_changes_log.json");

// // ✅ Ensure Log File Exists
// if (!fs.existsSync(logFilePath)) {
//   console.log("📂 Log file does not exist. Creating:", logFilePath);
//   try {
//     fs.writeFileSync(
//       logFilePath,
//       JSON.stringify({ logs: [], latestState: {} }, null, 2)
//     );
//     console.log("✅ Log file created successfully.");
//   } catch (err) {
//     console.error("❌ Error creating log file:", err.message);
//     process.exit(1);
//   }
// }

// // ✅ Function to Scan Directory Recursively
// function getCurrentState(dir) {
//   let state = {};

//   function scanDir(directory) {
//     const files = fs.readdirSync(directory);
//     files.forEach((file) => {
//       const filePath = path.join(directory, file);
//       const stats = fs.statSync(filePath);

//       if (stats.isDirectory()) {
//         scanDir(filePath);
//       } else {
//         try {
//           state[filePath] = fs.readFileSync(filePath, "utf-8").split("\n");
//         } catch (err) {
//           console.error("❌ Error reading file:", filePath, err.message);
//         }
//       }
//     });
//   }

//   scanDir(dir);
//   return state;
// }

// // ✅ Function to Detect File Changes
// function detectChanges(previousState, currentState) {
//   const changes = [];

//   for (const file in currentState) {
//     if (!previousState[file]) {
//       changes.push({ file, changeType: "file_added" });
//     } else {
//       const prevLines = previousState[file];
//       const currLines = currentState[file];
//       const maxLines = Math.max(prevLines.length, currLines.length);
//       const addedLines = [];
//       const removedLines = [];
//       const modifiedLines = [];

//       for (let i = 0; i < maxLines; i++) {
//         const prevLine = prevLines[i] || null;
//         const currLine = currLines[i] || null;
//         if (prevLine === null && currLine !== null)
//           addedLines.push({ line: i + 1, content: currLine });
//         if (prevLine !== null && currLine === null)
//           removedLines.push({ line: i + 1, content: prevLine });
//         if (prevLine !== currLine)
//           modifiedLines.push({
//             line: i + 1,
//             previous: prevLine,
//             current: currLine,
//           });
//       }

//       if (addedLines.length > 0)
//         changes.push({ file, changeType: "lines_added", details: addedLines });
//       if (removedLines.length > 0)
//         changes.push({
//           file,
//           changeType: "lines_removed",
//           details: removedLines,
//         });
//       if (modifiedLines.length > 0)
//         changes.push({
//           file,
//           changeType: "lines_changed",
//           details: modifiedLines,
//         });
//     }
//   }

//   for (const file in previousState) {
//     if (!currentState[file]) {
//       changes.push({ file, changeType: "file_removed" });
//     }
//   }
//   return changes;
// }

// // ✅ Load Previous State
// let previousState = {};
// try {
//   if (fs.existsSync(logFilePath)) {
//     const logData = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
//     previousState = logData.latestState || {};
//   }
// } catch (err) {
//   console.error("❌ Error reading log file:", err.message);
// }

// // ✅ Get Current State
// const currentState = getCurrentState(dirPath);
// const changes = detectChanges(previousState, currentState);

// // ✅ Log Changes
// const logData = {
//   timeStamp: new Date().toISOString(),
//   changes,
// };

// try {
//   const logContent = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
//   logContent.logs.push(logData);
//   logContent.latestState = currentState;

//   fs.writeFileSync(logFilePath, JSON.stringify(logContent, null, 2));
//   console.log("✅ Changes logged successfully.");
// } catch (err) {
//   console.error("❌ Error writing to log file:", err.message);
// }

// import fs from "fs";
// import path from "path";
// import crypto from "crypto";

// const dirPath = process.argv[2];

// if (!dirPath) {
//   console.error("❌ Error: No directory path provided.");
//   process.exit(1);
// }

// // ✅ Log File Path
// const logFilePath = path.join(dirPath, "codeFile_changes_log.json");

// // ✅ Ensure Log File Exists
// if (!fs.existsSync(logFilePath)) {
//   console.log("📂 Log file does not exist. Creating:", logFilePath);
//   try {
//     fs.writeFileSync(
//       logFilePath,
//       JSON.stringify({ logs: [], latestState: {} }, null, 2)
//     );
//     console.log("✅ Log file created successfully.");
//   } catch (err) {
//     console.error("❌ Error creating log file:", err.message);
//     process.exit(1);
//   }
// }

// // ✅ Function to generate a hash for file contents
// function hashContent(content) {
//   return crypto.createHash("sha256").update(content).digest("hex");
// }

// // ✅ Function to Scan Directory Recursively
// function getCurrentState(dir) {
//   let state = {};

//   function scanDir(directory) {
//     const files = fs.readdirSync(directory);
//     files.forEach((file) => {
//       const filePath = path.join(directory, file);
//       const stats = fs.statSync(filePath);

//       if (stats.isDirectory()) {
//         scanDir(filePath);
//       } else {
//         try {
//           const content = fs.readFileSync(filePath, "utf-8");
//           state[filePath] = hashContent(content); // Store hash instead of full content
//         } catch (err) {
//           console.error("❌ Error reading file:", filePath, err.message);
//         }
//       }
//     });
//   }

//   scanDir(dir);
//   return state;
// }

// // ✅ Function to Detect File Changes
// function detectChanges(previousState, currentState) {
//   const changes = [];

//   for (const file in currentState) {
//     if (!previousState[file]) {
//       changes.push({ file, changeType: "file_added" });
//     } else if (previousState[file] !== currentState[file]) {
//       changes.push({ file, changeType: "file_modified" });
//     }
//   }

//   for (const file in previousState) {
//     if (!currentState[file]) {
//       changes.push({ file, changeType: "file_removed" });
//     }
//   }

//   return changes;
// }

// // ✅ Load Previous State
// let previousState = {};
// try {
//   const rawData = fs.readFileSync(logFilePath, "utf-8").trim();
//   if (rawData) {
//     const logData = JSON.parse(rawData);
//     previousState = logData.latestState || {};
//   }
// } catch (err) {
//   console.error("❌ Error reading log file:", err.message);
// }

// // ✅ Get Current State
// const currentState = getCurrentState(dirPath);
// const changes = detectChanges(previousState, currentState);

// // ✅ Log Changes
// const logData = {
//   timeStamp: new Date().toISOString(),
//   changes,
// };

// const MAX_LOG_ENTRIES = 100;

// try {
//   const rawData = fs.readFileSync(logFilePath, "utf-8").trim();
//   let logContent = { logs: [], latestState: {} };

//   if (rawData) {
//     logContent = JSON.parse(rawData);
//   }

//   // Trim log entries to prevent excessive file size
//   if (logContent.logs.length >= MAX_LOG_ENTRIES) {
//     logContent.logs = logContent.logs.slice(-MAX_LOG_ENTRIES);
//   }

//   logContent.logs.push(logData);
//   logContent.latestState = currentState;

//   fs.writeFileSync(logFilePath, JSON.stringify(logContent, null, 2));
//   console.log("✅ Changes logged successfully.");
// } catch (err) {
//   console.error("❌ Error writing to log file:", err.message);
// }

// import fs from "fs";
// import path from "path";
// import crypto from "crypto";

// const dirPath = process.argv[2];

// if (!dirPath) {
//   console.error("❌ Error: No directory path provided.");
//   process.exit(1);
// }

// // ✅ Log File Path
// const logFilePath = path.join(dirPath, "codeFile_changes_log.json");

// // ✅ Ensure Log File Exists
// if (!fs.existsSync(logFilePath)) {
//   console.log("📂 Log file does not exist. Creating:", logFilePath);
//   try {
//     fs.writeFileSync(
//       logFilePath,
//       JSON.stringify({ logs: [], latestState: {} }, null, 2)
//     );
//     console.log("✅ Log file created successfully.");
//   } catch (err) {
//     console.error("❌ Error creating log file:", err.message);
//     process.exit(1);
//   }
// }

// // ✅ Function to Generate Hash of File Contents
// function hashContent(content) {
//   return crypto.createHash("sha256").update(content).digest("hex");
// }

// // ✅ Function to Scan Directory Recursively
// function getCurrentState(dir) {
//   let state = {};

//   function scanDir(directory) {
//     const files = fs.readdirSync(directory);
//     files.forEach((file) => {
//       const filePath = path.join(directory, file);
//       const stats = fs.statSync(filePath);

//       if (stats.isDirectory()) {
//         scanDir(filePath);
//       } else {
//         try {
//           const content = fs.readFileSync(filePath, "utf-8");
//           state[filePath] = {
//             hash: hashContent(content), // Store hash to reduce memory usage
//             lines: content.split("\n"), // Store actual lines for change detection
//           };
//         } catch (err) {
//           console.error("❌ Error reading file:", filePath, err.message);
//         }
//       }
//     });
//   }

//   scanDir(dir);
//   return state;
// }

// // ✅ Function to Detect File Changes at the Line Level
// // function detectChanges(previousState, currentState) {
// //   const changes = [];

// //   for (const file in currentState) {
// //     if (!previousState[file]) {
// //       changes.push({ file, changeType: "file_added" });
// //     } else {
// //       const prevLines = previousState[file].lines;
// //       const currLines = currentState[file].lines;
// //       const maxLines = Math.max(prevLines.length, currLines.length);
// //       const addedLines = [];
// //       const removedLines = [];
// //       const modifiedLines = [];

// //       for (let i = 0; i < maxLines; i++) {
// //         const prevLine = prevLines[i] || null;
// //         const currLine = currLines[i] || null;
// //         if (prevLine === null && currLine !== null)
// //           addedLines.push({ line: i + 1, content: currLine });
// //         if (prevLine !== null && currLine === null)
// //           removedLines.push({ line: i + 1, content: prevLine });
// //         if (prevLine !== currLine)
// //           modifiedLines.push({
// //             line: i + 1,
// //             previous: prevLine,
// //             current: currLine,
// //           });
// //       }

// //       if (addedLines.length > 0)
// //         changes.push({ file, changeType: "lines_added", details: addedLines });
// //       if (removedLines.length > 0)
// //         changes.push({
// //           file,
// //           changeType: "lines_removed",
// //           details: removedLines,
// //         });
// //       if (modifiedLines.length > 0)
// //         changes.push({
// //           file,
// //           changeType: "lines_changed",
// //           details: modifiedLines,
// //         });
// //     }
// //   }

// //   for (const file in previousState) {
// //     if (!currentState[file]) {
// //       changes.push({ file, changeType: "file_removed" });
// //     }
// //   }

// //   return changes;
// // }

// // function detectChanges(previousState, currentState) {
// //   const changes = [];

// //   for (const file in currentState) {
// //     const prevLines = previousState[file]?.lines || []; // Ensure it's an array
// //     const currLines = currentState[file]?.lines || [];

// //     if (!previousState[file]) {
// //       changes.push({ file, changeType: "file_added" });
// //     } else {
// //       const maxLines = Math.max(prevLines.length, currLines.length);
// //       const addedLines = [];
// //       const removedLines = [];
// //       const modifiedLines = [];

// //       for (let i = 0; i < maxLines; i++) {
// //         const prevLine = prevLines[i] || null;
// //         const currLine = currLines[i] || null;
// //         if (prevLine === null && currLine !== null)
// //           addedLines.push({ line: i + 1, content: currLine });
// //         if (prevLine !== null && currLine === null)
// //           removedLines.push({ line: i + 1, content: prevLine });
// //         if (prevLine !== currLine)
// //           modifiedLines.push({
// //             line: i + 1,
// //             previous: prevLine,
// //             current: currLine,
// //           });
// //       }

// //       if (addedLines.length > 0)
// //         changes.push({ file, changeType: "lines_added", details: addedLines });
// //       if (removedLines.length > 0)
// //         changes.push({
// //           file,
// //           changeType: "lines_removed",
// //           details: removedLines,
// //         });
// //       if (modifiedLines.length > 0)
// //         changes.push({
// //           file,
// //           changeType: "lines_changed",
// //           details: modifiedLines,
// //         });
// //     }
// //   }

// //   for (const file in previousState) {
// //     if (!currentState[file]) {
// //       changes.push({ file, changeType: "file_removed" });
// //     }
// //   }

// //   return changes;
// // }

// // ✅ Load Previous State (Handles JSON Errors Safely)
// let previousState = {};
// try {
//   const rawData = fs.readFileSync(logFilePath, "utf-8").trim();
//   if (rawData) {
//     previousState = JSON.parse(rawData).latestState || {};
//   }
// } catch (err) {
//   console.error("❌ Error reading log file:", err.message);
// }

// // ✅ Get Current State
// const currentState = getCurrentState(dirPath);
// const changes = detectChanges(previousState, currentState);

// // ✅ Log Changes
// const logData = {
//   timeStamp: new Date().toISOString(),
//   changes,
// };

// const MAX_LOG_ENTRIES = 100;

// try {
//   const rawData = fs.readFileSync(logFilePath, "utf-8").trim();
//   let logContent = { logs: [], latestState: {} };

//   if (rawData) {
//     logContent = JSON.parse(rawData);
//   }

//   // ✅ Trim log entries to prevent excessive file size
//   if (logContent.logs.length >= MAX_LOG_ENTRIES) {
//     logContent.logs = logContent.logs.slice(-MAX_LOG_ENTRIES);
//   }

//   logContent.logs.push(logData);

//   // ✅ Store only hashes to reduce memory usage in `latestState`
//   const optimizedState = {};
//   for (const file in currentState) {
//     optimizedState[file] = { hash: currentState[file].hash };
//   }

//   logContent.latestState = optimizedState;

//   fs.writeFileSync(logFilePath, JSON.stringify(logContent, null, 2));
//   console.log("✅ Changes logged successfully.");
// } catch (err) {
//   console.error("❌ Error writing to log file:", err.message);
// }

import fs from "fs";
import path from "path";

// ✅ Get Directory or File Path from Command Line Argument
const targetPath = process.argv[2];

if (!targetPath) {
  console.error(
    "❌ No path provided! Please specify a file or directory path."
  );
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  console.error(`❌ The path "${targetPath}" does not exist.`);
  process.exit(1);
}

console.log(`📂 Tracking: ${targetPath}`);

// ✅ Get Current File State (Line by Line)
function getCurrentState(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n");
  } catch (err) {
    if (err.code === "ENOENT") {
      return []; // File doesn't exist
    }
    throw err;
  }
}

// ✅ Load Last Known State
function getLastKnownState(logFilePath) {
  if (!fs.existsSync(logFilePath)) {
    return [];
  }
  const logData = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
  return logData.lastState || [];
}

// ✅ Save and Update the Log
function saveLogAndState(logFilePath, newLogs, currentState) {
  try {
    let logData = { lastState: [], logs: [] };

    if (fs.existsSync(logFilePath)) {
      logData = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
    }

    logData.logs.push(...newLogs);
    logData.lastState = currentState;

    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 4));
  } catch (error) {
    console.error("Error saving log data:", error);
  }
}

// ✅ Track File Changes
function trackFileChanges(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    return;
  }

  const logFilePath = `${filePath}.log.json`;

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(
      logFilePath,
      JSON.stringify({ lastState: [], logs: [] }, null, 4)
    );
  }

  let previousLines = getCurrentState(filePath);

  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      const currentLines = getCurrentState(filePath);
      const addLines = [];
      const removedLines = [];
      const changedLines = [];

      const maxLines = Math.max(previousLines.length, currentLines.length);
      for (let i = 0; i < maxLines; i++) {
        const prevLine = previousLines[i] || null;
        const currLine = currentLines[i] || null;

        if (prevLine === null && currLine !== null) {
          addLines.push({ line: i + 1, content: currLine });
        } else if (prevLine !== null && currLine === null) {
          removedLines.push({ line: i + 1, content: prevLine });
        } else if (prevLine !== currLine) {
          changedLines.push({
            line: i + 1,
            previous: prevLine,
            current: currLine,
          });
        }
      }

      const newLogs = [];
      if (addLines.length > 0) {
        newLogs.push({
          timestamp: new Date().toISOString(),
          changeType: "lines_added",
          details: addLines,
        });
      }
      if (removedLines.length > 0) {
        newLogs.push({
          timestamp: new Date().toISOString(),
          changeType: "lines_removed",
          details: removedLines,
        });
      }
      if (changedLines.length > 0) {
        newLogs.push({
          timestamp: new Date().toISOString(),
          changeType: "lines_changed",
          details: changedLines,
        });
      }

      saveLogAndState(logFilePath, newLogs, currentLines);

      if (newLogs.length > 0) {
        console.log(`✅ Changes logged for: ${filePath}`);
      } else {
        console.log(`No changes detected for: ${filePath}`);
      }

      previousLines = currentLines;
    }
  });

  console.log(`📂 Watching file: ${filePath}`);
}

// ✅ Function to Get All Files Recursively (Only if Directory)
function getAllFiles(dir) {
  let filesList = [];

  function scanDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        scanDir(filePath);
      } else {
        filesList.push(filePath);
      }
    });
  }

  scanDir(dir);
  return filesList;
}

// ✅ Determine if Path is a File or Directory
const stats = fs.statSync(targetPath);
if (stats.isDirectory()) {
  const filesToWatch = getAllFiles(targetPath);
  filesToWatch.forEach(trackFileChanges);
} else {
  trackFileChanges(targetPath);
}
