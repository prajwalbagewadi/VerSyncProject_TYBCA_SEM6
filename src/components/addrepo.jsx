import { useState } from "react";
import { useEffect } from "react";

import axios from "axios";

function AddRepo({ setShowCard }) {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    console.log("Selected files:", selectedFiles, "type", typeof selectedFiles);

    const selectedPaths = selectedFiles.map(
      (file) => file.webkitRelativePath || file.name
    );

    console.log("Selected paths:", selectedPaths, "type", typeof selectedPaths);

    // ✅ Correctly update state
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setPaths((prevPaths) => [...prevPaths, ...selectedPaths]);

    console.log("Files in state after update:", selectedFiles);
    console.log("Paths in state after update:", selectedPaths);
  };

  // const handleFiles = (event) => {
  //   const selectedFiles = Array.from(event.target.files);
  //   console.log("Selected files:", selectedFiles);

  //   const selectedPaths = selectedFiles.map(
  //     (file) => file.webkitRelativePath || file.name
  //   );
  //   console.log("Selected paths:", selectedPaths);

  //   setFiles(selectedFiles);
  //   setPaths(selectedPaths); // Ensure paths are being set
  // };

  // const runExternalScript = () => {
  //   console.log("scriptRunning");
  //   const script = document.createElement("script");
  //   script.src = "Dir_change_tracker_with_log.js"; // Update with actual path
  //   script.async = true;
  //   document.body.appendChild(script);
  // };

  const handleCreateRepo = async () => {
    if (!repoName.trim()) {
      alert("Repo name is required.");
      return;
    }

    if (files.length === 0) {
      alert("No files selected.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("name", repoName.trim());
      formData.append("description", [description.trim(), paths] || "null");
      //formData.append("paths", paths.trim() || "null");
      files.forEach((file) => {
        formData.append("files", file);
      });

      //formData.append("paths", JSON.stringify(paths));
      console.log("Files in state formData:", files);
      console.log("Paths in state formData:", paths);

      // ✅ Debugging FormData Entries
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log("Uploading to:", "http://localhost:3000/api/repos");

      const response = await axios.post(
        "http://localhost:3000/api/repos",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Repo created successfully:", response.data);
      setSuccessMessage("Repo created and files uploaded successfully!");

      //runExternalScript();
      setRepoName("");
      setDescription("");
      setFiles([]);
      setPaths([]);
    } catch (err) {
      console.error(
        "Error creating repo or uploading files.",
        err.response?.data || err.message
      );
      setErrorMessage("Failed to create repo or upload files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-white">Hello Prajwal</h1>
      <div className="p-4 flex flex-col items-start text-white text-center border-2 border-b-blue-700 rounded-lg">
        <input
          type="text"
          placeholder="Repo Name"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Repo Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
        <input
          type="file"
          multiple
          webkitdirectory=""
          onChange={handleFiles}
          className="mb-2 p-2 border rounded"
        />
        {/* <button className="active:bg-amber-400" type="submit">
          Upload
        </button> */}
        <button
          onClick={handleCreateRepo}
          className="active:bg-amber-400  border rounded p-2"
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
      </div>
    </div>
  );
}

export default AddRepo;
