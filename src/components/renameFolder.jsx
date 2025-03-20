import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SubfolderView() {
  const { repoName } = useParams();
  const [subfolders, setSubfolders] = useState([]);
  const [currentPath, setCurrentPath] = useState(repoName);
  const [error, setError] = useState(null);
  const [renameFolder, setRenameFolder] = useState(null); // Track folder being renamed
  const [newFolderName, setNewFolderName] = useState(""); // New folder name

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `http://localhost:3000/subfolders/${currentPath}`
        );
        if (!response.ok)
          throw new Error(`Server error! Status: ${response.status}`);

        const data = await response.json();
        setSubfolders(data.subfolders || []);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [currentPath]);

  async function handleRename(folder) {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch("http://localhost:3000/rename-folder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPath: `${currentPath}/${folder}`,
          newName: newFolderName,
        }),
      });

      if (!response.ok) throw new Error("Rename failed");

      setSubfolders(subfolders.map((f) => (f === folder ? newFolderName : f))); // Update UI
      setRenameFolder(null);
      setNewFolderName("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-full mx-auto">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        Contents of {currentPath}
      </h2>
      {error && <p className="text-red-400 mb-3">{error}</p>}

      {/* Subfolders Section */}
      <h3 className="text-lg text-gray-300">📁 Subfolders</h3>
      <ul className="space-y-2 mb-4">
        {subfolders.map((folder, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-2 rounded-md hover:bg-gray-800"
          >
            <span
              onClick={() => setCurrentPath(`${currentPath}/${folder}`)}
              className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center"
            >
              📁 {folder}
            </span>
            {renameFolder === folder ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="p-1 text-black rounded"
                />
                <button
                  onClick={() => handleRename(folder)}
                  className="bg-green-500 px-2 py-1 rounded"
                >
                  ✔
                </button>
                <button
                  onClick={() => setRenameFolder(null)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  ✖
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRenameFolder(folder)}
                className="text-yellow-400"
              >
                ✏ Rename
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubfolderView;
