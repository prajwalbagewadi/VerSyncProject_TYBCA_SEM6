// // import { useState, useEffect } from "react";

// // function Subfolder() {
// //   const [subfolders, setSubfolders] = useState([]);

// //   useEffect(() => {
// //     fetch("http://localhost:3000/subfolders")
// //       .then((response) => response.json())
// //       .then((data) => setSubfolders(data.subfolders))
// //       .catch((error) => console.error("Error fetching subfolders:", error));
// //   }, []);

// //   return (
// //     <div>
// //       <h2>Subfolders</h2>
// //       <ul>
// //         {subfolders.map((folder, index) => (
// //           <li key={index}>{folder}</li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // }

// // export default Subfolder;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { FaArrowLeft, FaFolder } from "react-icons/fa";

// const SubfolderView = () => {
//   const { repoName } = useParams();
//   const [subfolders, setSubfolders] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSubfolders = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/subfolders/${repoName}`
//         );

//         if (!response.ok) {
//           throw new Error(`Server error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setSubfolders(data.subfolders || []);
//       } catch (error) {
//         console.error("Error fetching subfolders:", error);
//       }
//     };

//     fetchSubfolders();
//   }, [repoName]);

//   return (
//     <div className="p-5">
//       <button
//         className="text-white bg-gray-700 px-4 py-2 rounded flex items-center gap-2"
//         onClick={() => navigate(-1)}
//       >
//         <FaArrowLeft /> Back
//       </button>
//       <h2 className="text-2xl text-white mt-4">{repoName} - Subfolders</h2>

//       {subfolders.length > 0 ? (
//         <div className="grid grid-cols-3 gap-4 mt-4">
//           {subfolders.map((folder, index) => (
//             <button
//               key={index}
//               className="bg-gray-800 text-white p-4 rounded-lg flex items-center gap-2 hover:bg-gray-700"
//             >
//               <FaFolder className="text-yellow-400" />
//               {folder}
//             </button>
//           ))}
//         </div>
//       ) : (
//         <p className="text-white mt-4">No subfolders found.</p>
//       )}
//     </div>
//   );
// };

// export default SubfolderView;

import CodeEditor from "./CodeEditior";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FileCommentsAndTags from "./FileCommentsAndTags";

// function SubfolderView() {
//   const { repoName } = useParams();
//   const [subfolders, setSubfolders] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!repoName) {
//       setError("❌ Missing repository name in URL.");
//       return;
//     }

//     async function fetchSubfolders() {
//       try {
//         console.log("🔍 Fetching subfolders for:", repoName);
//         const response = await fetch(
//           `http://localhost:3000/subfolders/${repoName}`
//         );

//         if (!response.ok) {
//           throw new Error(`Server error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setSubfolders(data.subfolders);
//       } catch (err) {
//         console.error("❌ Error fetching subfolders:", err);
//         setError(err.message);
//       }
//     }

//     fetchSubfolders();
//   }, [repoName]);

//   return (
//     <div>
//       <h2>Subfolders in {repoName}</h2>
//       {error ? <p style={{ color: "red" }}>{error}</p> : null}
//       <ul>
//         {subfolders.map((folder, index) => (
//           <li key={index}>{folder}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// function SubfolderView() {
//   const { repoName } = useParams();
//   const [subfolders, setSubfolders] = useState([]);
//   const [currentPath, setCurrentPath] = useState(repoName);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchSubfolders() {
//       try {
//         console.log("🔍 Fetching subfolders for:", currentPath);
//         const response = await fetch(
//           `http://localhost:3000/subfolders/${currentPath}`
//         );

//         if (!response.ok) {
//           throw new Error(`Server error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setSubfolders(data.subfolders);
//       } catch (err) {
//         console.error("❌ Error fetching subfolders:", err);
//         setError(err.message);
//       }
//     }

//     fetchSubfolders();
//   }, [currentPath]);

//   return (
//     <div className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-md mx-auto">
//       <h2 className="text-xl font-semibold text-gray-200 mb-4">
//         Subfolders in {currentPath}
//       </h2>
//       {error && <p className="text-red-400 mb-3">{error}</p>}
//       <ul className="space-y-2">
//         {subfolders.map((folder, index) => (
//           <li
//             key={index}
//             onClick={() => setCurrentPath(`${currentPath}/${folder}`)}
//             className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800"
//           >
//             <span>📁</span>
//             <span>{folder}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

function SubfolderView() {
  const { repoName } = useParams();
  const [subfolders, setSubfolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(repoName);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Track selected file
  const [renameMode, setRenameMode] = useState(null); // Track renaming state
  const [newName, setNewName] = useState(""); // Store new name

  const handleRename = async (oldName) => {
    if (!newName.trim()) return;

    try {
      const response = await fetch("http://localhost:3000/api/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPath: `${currentPath}/${oldName}`,
          newPath: `${currentPath}/${newName}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRenameMode(null);
        setNewName("");
        setSubfolders((prev) =>
          prev.map((item) => (item === oldName ? newName : item))
        );
        setFiles((prev) =>
          prev.map((item) => (item === oldName ? newName : item))
        );
      }
    } catch (error) {
      console.error("Rename failed:", error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 Fetching subfolders & files for:", currentPath);
        const response = await fetch(
          `http://localhost:3000/subfolders/${currentPath}`
        );

        if (!response.ok) {
          throw new Error(`Server error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSubfolders(data.subfolders || []);
        setFiles(data.files || []);
      } catch (err) {
        console.error("❌ Error fetching subfolders:", err);
        setError(err.message);
      }
    }

    fetchData();
  }, [currentPath]);

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-full mx-auto">
      <h1 className="text-4xl text-white font-bold flex items-center space-x-2 justify-center">
        <span>🚀 VerSync</span>
      </h1>
      <p className="text-lg text-white mt-2">
        ⚡ Next-Gen Version Control System for Effortless Collaboration 🔥
      </p>
      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        Contents of {currentPath}
      </h2>
      {error && <p className="text-red-400 mb-3">{error}</p>}

      {/* Subfolders Section */}
      <h3 className="text-lg text-gray-300">📁 Subfolders</h3>
      {/* <ul className="space-y-2 mb-4">
        {subfolders.length > 0 ? (
          subfolders.map((folder, index) => (
            <li
              key={index}
              //onClick={() => setCurrentPath(`${currentPath}/${folder}`)}
              onClick={() => setCurrentPath(`${currentPath}/${folder}`)}
              className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800"
            >
              <span>📁</span>
              <span>{folder}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-400">No subfolders found.</p>
        )}
      </ul> */}

      <ul>
        {subfolders.map((folder, index) => (
          <li
            key={index}
            className=" text-gray-300 flex items-center space-x-2"
          >
            {renameMode === folder ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                />
                <button onClick={() => handleRename(folder)}>✔</button>
                <button onClick={() => setRenameMode(null)}>✖</button>
              </>
            ) : (
              <>
                <span
                  onClick={() => setCurrentPath(`${currentPath}/${folder}`)}
                >
                  📁 {folder}
                </span>
                <button onClick={() => setRenameMode(folder)}>✏ Rename</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Files Section */}
      <h3 className="text-lg text-gray-300">📄 Files</h3>
      {/* <ul className="space-y-2">
        {files.length > 0 ? (
          files.map((file, index) => (
            <li
              key={index}
              onClick={() => setSelectedFile(`${currentPath}/${file}`)} // Open file in editor
              className="text-gray-300 flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800"
            >
              <span>📄</span>
              <span>{file}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-400">No files found.</p>
        )}
      </ul> */}

      {/* Files */}
      <ul>
        {files.map((file, index) => (
          <li
            key={index}
            className=" text-gray-300 flex items-center space-x-2"
          >
            {renameMode === file ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                />
                <button onClick={() => handleRename(file)}>✔</button>
                <button onClick={() => setRenameMode(null)}>✖</button>
              </>
            ) : (
              <>
                <span onClick={() => setSelectedFile(`${currentPath}/${file}`)}>
                  📄 {file}
                </span>
                <button onClick={() => setRenameMode(file)}>✏ Rename</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* File Comments and Tags Section */}
      {selectedFile && <FileCommentsAndTags fileName={selectedFile} />}

      {/* Code Editor - Only show when a file is selected */}
      {selectedFile && (
        <div className="mt-6">
          <h3 className="text-lg text-gray-200 mb-2">
            Editing: {selectedFile}
          </h3>
          <CodeEditor filePath={`http://localhost:3000/file/${selectedFile}`} />
        </div>
      )}
      {/* Footer Section */}
      <footer className="mt-10 text-center text-white">
        <p>
          © {new Date().getFullYear()} 📜 Prajwal Bagewadi. All Rights Reserved.
        </p>
        <p>
          🎨 Designed & 💻 Developed by{" "}
          <span className="text-blue-400 font-semibold">Prajwal Bagewadi</span>
        </p>
      </footer>
    </div>
  );
}

export default SubfolderView;

//export default SubfolderView;
