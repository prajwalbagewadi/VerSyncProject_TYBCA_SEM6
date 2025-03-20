// // const fs = require("fs");
// // const path = require("path");
// import fs from "fs";
// import path from "path";

// // The rest of your code remains unchanged...

// //import { timeStamp } from "console";
// //const { timeStamp } = require("console");
// import { timeStamp } from "console";
// //import fs from "fs";
// //import path from "path";
// /**
//  * Below is a JavaScript program that uses Node.js and the fs module to track changes in files within a specified directory. It monitors for added, changed, renamed, and removed files
//  * status:working program
//  * author:prajwalBagewadi
//  * date:02-01-2025 11:23pm
//  */

// // const dirPath =
// //   "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\node_Server\\uploads\\rn5";
// // const logfilepath =
// //   "C:\\Users\\bagew\\Desktop\\WebDev\\VCS\\NotesApp\\notesApp\\node_Server\\uploads\\rn5\\tf2_logTracker.json";

// const dirPath = process.argv[2];
// console.log("dirPath=", dirPath);
// if (!dirPath) {
//   console.error("Error: No directory path provided.");
//   process.exit(1);
// }

// const logfilepath = path.join(dirPath, "tf2_logTracker.json");

// //current state of files in the directory
// function getCurrentState(dirPath) {
//   const files = fs.readdirSync(dirPath);
//   const state = {};

//   files.forEach((file) => {
//     const filePath = path.join(dirPath, file);
//     const stats = fs.statSync(filePath);
//     state[file] = {
//       mtimeMS: stats.mtimeMS, // Use modification time as reference
//       timestamp: new Date().toISOString, // Save the current timestamp
//     };
//   });
//   return state;
// }

// //detect changes
// function detectChanges(previousState, currentState) {
//   const added = [];
//   const removed = [];
//   const changed = [];
//   const renamed = [];

//   //added or changed files
//   for (const file in currentState) {
//     if (!previousState[file]) {
//       added.push({ file, timestamp: currentState[file].timestamp });
//     } else if (currentState[file].mtimeMS !== previousState[file].mtimeMS) {
//       changed.push({ file, timestamp: currentState[file].timestamp });
//     }
//   }

//   //removed files
//   for (const file in previousState) {
//     if (!currentState[file]) {
//       removed.push({ file, timestamp: previousState[file].timestamp });
//     }
//   }

//   //renamed
//   for (const file in previousState) {
//     if (currentState[file] && !currentState.hasOwnProperty(file)) {
//       renamed.push({ file, timestamp: previousState[file].timestamp });
//     }
//   }

//   return { added, changed, removed, renamed };
// }

// //load if exist / else init it
// let previousState = {};
// if (fs.existsSync(logfilepath)) {
//   //previousState = JSON.parse(fs.readFileSync(logfilepath, "utf-8"));
//   const logData = JSON.parse(fs.readFileSync(logfilepath, "utf-8"));
//   previousState = logData.logs.reduce((acc, logEntry) => {
//     logEntry.changes.added.forEach((file) => {
//       acc[file.file] = { mtimeMS: Infinity }; //mark as added
//     });
//     logEntry.changes.changed.forEach((file) => {
//       acc[file.file] = { mtimeMS: Infinity }; //mark as changed
//     });
//     logEntry.changes.removed.forEach((file) => {
//       acc[file.file] = { mtimeMS: Infinity }; // remove file from previous state
//     });
//     return acc;
//   }, {});
// } else {
//   console.log("log file doesnt exist. creating new file");
//   fs.writeFileSync(logfilepath, JSON.stringify({ logs: [] }, null, 2));
// }

// //current state
// const currentState = getCurrentState(dirPath);

// //changes
// const changes = detectChanges(previousState, currentState);

// //log change
// // const logData = { timeStamp: new Date().toISOString(), changes, };

// //save log
// // if (!fs.existsSync(logfilepath)) {
// //   console.log("log file doesnt exist. creating new file");
// //   fs.writeFileSync(logfilepath, JSON.stringify({ logs: [] }, null, 2));
// // }
// // fs.writeFileSync(logfilepath, JSON.stringify(currentState, null, 2));
// // fs.appendFileSync(logfilepath, JSON.stringify(logData, null, 2) + ",\n");
// // console.log("changes logged successful.");

// //append change in log
// const logData = {
//   timeStamp: new Date().toISOString(),
//   changes,
// };

// const logcontent = JSON.parse(fs.readFileSync(logfilepath, "utf-8")); //load existing content
// logcontent.logs.push(logData); //Add new log data

// //save updated logs
// fs.writeFileSync(logfilepath, JSON.stringify(logcontent, null, 2)); //write back to log file
// console.log("changes logged successful.");

// import fs from "fs";
// import path from "path";

// const dirPath = process.argv[2];
// if (!dirPath) {
//   console.error("Error: No directory path provided.");
//   process.exit(1);
// }

// const logfilepath = path.join(dirPath, "tf2_logTracker.json");

// function getCurrentState(dirPath) {
//   let state = {};
//   function scanDir(dir) {
//     const files = fs.readdirSync(dir);
//     files.forEach((file) => {
//       const filePath = path.join(dir, file);
//       const stats = fs.statSync(filePath);
//       if (stats.isDirectory()) {
//         scanDir(filePath);
//       } else {
//         state[filePath] = {
//           mtimeMS: stats.mtimeMS,
//           timestamp: new Date().toISOString(),
//         };
//       }
//     });
//   }
//   scanDir(dirPath);
//   return state;
// }

// function detectChanges(previousState, currentState) {
//   const added = [];
//   const removed = [];
//   const changed = [];

//   for (const file in currentState) {
//     if (!previousState[file]) {
//       added.push({ file, timestamp: currentState[file].timestamp });
//     } else if (currentState[file].mtimeMS !== previousState[file].mtimeMS) {
//       changed.push({ file, timestamp: currentState[file].timestamp });
//     }
//   }

//   for (const file in previousState) {
//     if (!currentState[file]) {
//       removed.push({ file, timestamp: previousState[file].timestamp });
//     }
//   }

//   return { added, changed, removed };
// }

// let previousState = {};
// if (fs.existsSync(logfilepath)) {
//   const logData = JSON.parse(fs.readFileSync(logfilepath, "utf-8"));
//   previousState = logData.latestState || {};
// } else {
//   fs.writeFileSync(
//     logfilepath,
//     JSON.stringify({ logs: [], latestState: {} }, null, 2)
//   );
// }

// const currentState = getCurrentState(dirPath);
// const changes = detectChanges(previousState, currentState);

// const logData = {
//   timeStamp: new Date().toISOString(),
//   changes,
// };

// const logcontent = JSON.parse(fs.readFileSync(logfilepath, "utf-8"));
// logcontent.logs.push(logData);
// logcontent.latestState = currentState;

// fs.writeFileSync(logfilepath, JSON.stringify(logcontent, null, 2));
// console.log("Changes logged successfully.");

import fs from "fs";
import path from "path";

const dirPath = process.argv[2];

if (!dirPath) {
  console.error("Error: No directory path provided.");
  process.exit(1);
}

const logFilePath = path.join(dirPath, "tf2_logTracker.json");

/**
 * Recursively scans a directory and returns the current state of all files.
 * @param {string} dir - Directory path to scan.
 * @returns {object} - A map of file paths with timestamps.
 */
function getCurrentState(dir) {
  let state = {};

  function scanDir(directory) {
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        scanDir(filePath); // Recursively scan subdirectories
      } else {
        state[filePath] = {
          mtimeMS: stats.mtimeMS,
          timestamp: new Date().toISOString(),
        };
      }
    });
  }

  scanDir(dir);
  return state;
}

/**
 * Compares previous and current states to detect changes.
 * @param {object} previousState - Previous snapshot of directory state.
 * @param {object} currentState - Latest snapshot of directory state.
 * @returns {object} - Lists of added, changed, and removed files.
 */
function detectChanges(previousState, currentState) {
  const added = [];
  const removed = [];
  const changed = [];

  // Detect added or changed files
  for (const file in currentState) {
    if (!previousState[file]) {
      added.push({ file, timestamp: currentState[file].timestamp });
    } else if (currentState[file].mtimeMS !== previousState[file].mtimeMS) {
      changed.push({ file, timestamp: currentState[file].timestamp });
    }
  }

  // Detect removed files
  for (const file in previousState) {
    if (!currentState[file]) {
      removed.push({ file, timestamp: previousState[file].timestamp });
    }
  }

  return { added, changed, removed };
}

// Load previous state from log file (if it exists)
let previousState = {};
if (fs.existsSync(logFilePath)) {
  const logData = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
  previousState = logData.latestState || {};
} else {
  fs.writeFileSync(
    logFilePath,
    JSON.stringify({ logs: [], latestState: {} }, null, 2)
  );
}

// Capture current state
const currentState = getCurrentState(dirPath);

// Detect changes
const changes = detectChanges(previousState, currentState);

// Prepare log entry
const logData = {
  timeStamp: new Date().toISOString(),
  changes,
};

// Append log entry to the log file
const logContent = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
logContent.logs.push(logData);
logContent.latestState = currentState;

// Write updated log file
fs.writeFileSync(logFilePath, JSON.stringify(logContent, null, 2));
console.log("Changes logged successfully.");
