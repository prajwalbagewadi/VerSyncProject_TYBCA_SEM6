import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const FileEditor = () => {
  const { "*": filePath } = useParams(); // ✅ Ensure full path capture
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const encodedPath = encodeURIComponent(filePath);
        const response = await fetch(
          `http://localhost:3000/file/${encodedPath}`
        );

        if (!response.ok) throw new Error("Failed to fetch file");

        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [filePath]);

  const handleSave = async () => {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(
        `http://localhost:3000/file/${encodedPath}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) throw new Error("Failed to save file");

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading file...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        Editing: {filePath}
      </h2>

      <textarea
        className="w-full h-80 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:outline-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Save Changes
      </button>

      {saved && (
        <p className="text-green-400 mt-2">✅ File saved successfully!</p>
      )}
    </div>
  );
};

export default FileEditor;
