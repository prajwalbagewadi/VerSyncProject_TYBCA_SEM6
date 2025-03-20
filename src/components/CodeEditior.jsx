import { useState, useEffect } from "react";

// const CodeEditor = ({ filePath }) => {
//   const [code, setCode] = useState("");

//   // Function to fetch file from a given URL
//   const fetchFileContent = async (path) => {
//     try {
//       const response = await fetch(path);
//       if (!response.ok) throw new Error("Failed to load file");
//       const text = await response.text();
//       setCode(text);
//     } catch (error) {
//       console.error("Error loading file:", error);
//     }
//   };

//   // Load file when filePath prop changes
//   useEffect(() => {
//     if (filePath) {
//       fetchFileContent(filePath);
//     }
//   }, [filePath]);

//   // Function to handle manual file upload
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => setCode(e.target.result);
//       reader.readAsText(file);
//     }
//   };

//   // Function to save file
//   const saveFile = () => {
//     const blob = new Blob([code], { type: "text/plain" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = "edited_code.txt";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   return (
//     <div className="bg-gray-900 text-white flex flex-col items-center p-6 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4">Code Editor</h2>

//       <div className="flex gap-4 mb-4">
//         <input
//           type="file"
//           onChange={handleFileUpload}
//           className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
//         />
//         <button
//           onClick={saveFile}
//           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
//         >
//           Save File
//         </button>
//       </div>

//       <textarea
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         className="w-full max-w-3xl h-96 p-4 bg-gray-800 border border-gray-700 rounded text-white resize-none outline-none"
//       />
//     </div>
//   );
// };

// const CodeEditor = ({ filePath }) => {
//   const [code, setCode] = useState("");

//   // Function to fetch file from a given URL
//   const fetchFileContent = async (path) => {
//     try {
//       console.log("Fetching file from:", path); // Debugging

//       const response = await fetch(path);
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const text = await response.text();
//       console.log("File loaded successfully!");
//       setCode(text);
//     } catch (error) {
//       console.error("Error loading file:", error.message);
//     }
//   };

//   // Load file when filePath prop changes
//   useEffect(() => {
//     if (filePath) {
//       console.log("Attempting to load file:", filePath); // Debugging
//       fetchFileContent(filePath);
//     }
//   }, [filePath]);

//   // Function to handle manual file upload
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => setCode(e.target.result);
//       reader.readAsText(file);
//     }
//   };

//   // Function to save file
//   const saveFile = () => {
//     const blob = new Blob([code], { type: "text/plain" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = "edited_code.txt";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   return (
//     <div className="bg-gray-900 text-white flex flex-col items-center p-6 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4">Code Editor</h2>

//       <div className="flex gap-4 mb-4">
//         <input
//           type="file"
//           onChange={handleFileUpload}
//           className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
//         />
//         <button
//           onClick={saveFile}
//           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
//         >
//           Save File
//         </button>
//       </div>

//       <textarea
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         className="w-full max-w-3xl h-96 p-4 bg-gray-800 border border-gray-700 rounded text-white resize-none outline-none"
//       />
//     </div>
//   );
// };

const CodeEditor = ({ filePath }) => {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("edited_code.txt"); // Default file name

  // Function to fetch file from a given URL
  //   const fetchFileContent = async (path) => {
  //     try {
  //       if (!path) {
  //         console.warn("No file path provided.");
  //         return;
  //       }

  //       console.log("Fetching file from:", path); // Debugging log

  //       const response = await fetch(path);
  //       if (!response.ok) {
  //         throw new Error(`Failed to load file. HTTP Status: ${response.status}`);
  //       }

  //       const text = await response.text();
  //       console.log("File loaded successfully!");
  //       setCode(text);
  //     } catch (error) {
  //       console.error("Error loading file:", error.message);
  //     }
  //   };

  const fetchFileContent = async (path) => {
    try {
      if (!path) {
        console.warn("❌ No file path provided.");
        return;
      }

      const apiUrl = `http://localhost:3000/open-file/${encodeURIComponent(
        path
      )}`;
      console.log("🔍 Fetching file from:", apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`❌ HTTP error! Status: ${response.status}`);
      }

      const { content } = await response.json();
      console.log("✅ File loaded successfully!");
      setCode(content);
    } catch (error) {
      console.error("❌ Error loading file:", error.message);
    }
  };

  // Load file when filePath prop changes
  useEffect(() => {
    if (filePath) {
      console.log("Attempting to load file:", filePath); // Debugging log
      fetchFileContent(filePath);
      setFileName(filePath.split("/").pop() || "edited_code.txt"); // Extracts filename from path
    }
  }, [filePath]);

  // Function to handle manual file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Set uploaded file name
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target.result);
      reader.readAsText(file);
    }
  };

  // Function to save file
  // const saveFile = () => {
  //   const blob = new Blob([code], { type: "text/plain" });
  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  //   a.download = fileName;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  // Function to save file changes back to the server
  // const saveFile = async () => {
  //   if (!filePath) {
  //     console.error("❌ No file path provided.");
  //     return;
  //   }

  //   try {
  //     const apiUrl = `http://localhost:3000/save-file`;
  //     const response = await fetch(apiUrl, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         filePath: filePath, // Original file path
  //         content: code, // Updated file content
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`❌ Failed to save file! Status: ${response.status}`);
  //     }

  //     console.log("✅ File saved successfully!");
  //     alert("File saved successfully!");
  //   } catch (error) {
  //     console.error("❌ Error saving file:", error.message);
  //     alert("Failed to save file.");
  //   }
  // };

  const saveFile = async () => {
    if (!filePath) {
      console.error("❌ No file path available for saving.");
      return;
    }

    // ✅ Extract relative path from the full URL
    const relativeFilePath = filePath.replace(/^https?:\/\/[^\/]+\/file\//, "");

    try {
      const response = await fetch("http://localhost:3000/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: relativeFilePath, content: code }),
      });

      if (!response.ok)
        throw new Error(`❌ Failed to save file! Status: ${response.status}`);

      console.log("✅ File saved successfully!");
      alert("File saved successfully!");
    } catch (error) {
      console.error("❌ Error saving file:", error.message);
    }
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col justify-center items-center p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Code Editor</h2>

      <div className="flex gap-4 mb-4 w-full h-full">
        <input
          type="file"
          onChange={handleFileUpload}
          className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
        />
        <button
          onClick={saveFile}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Save File
        </button>
      </div>

      <p className="mb-2 text-gray-400">
        {fileName ? `Editing: ${fileName}` : "No file loaded"}
      </p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full  h-96 p-4 bg-gray-800 border border-gray-700 rounded text-white resize-none outline-none"
      />
    </div>
  );
};

export default CodeEditor;
