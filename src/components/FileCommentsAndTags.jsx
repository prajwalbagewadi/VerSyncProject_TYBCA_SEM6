import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; // Change this to match your backend URL

function FileCommentsAndTags({ fileName }) {
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch comments and tags when fileName changes
  useEffect(() => {
    if (fileName) {
      fetchFileData();
    }
  }, [fileName]);

  const fetchFileData = async () => {
    try {
      setLoading(true);
      const encodedFileName = encodeURIComponent(fileName);

      const res = await axios.get(`${API_BASE_URL}/file/${encodedFileName}`);

      if (res.data.success) {
        setComments(res.data.comments);
        setTags(res.data.tags);
      } else {
        setError("No data found for this file.");
      }
    } catch (err) {
      setError("Failed to fetch file data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a tag or comment
  const handleAddTagOrComment = async () => {
    if (!newTag.trim() && !newComment.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/file/add`, {
        fileName: fileName,
        tag: newTag || undefined,
        comment: newComment || undefined,
      });

      console.log("res=", res);

      if (res.data.success) {
        setTags(res.data.tags || []);
        setComments(res.data.comments || []);
        setNewTag("");
        setNewComment("");
      }
    } catch (err) {
      setError("Error adding tag or comment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md shadow-md">
      {/* File Name */}
      <h3 className="text-lg font-semibold text-gray-200">{fileName}</h3>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Loading Indicator */}
      {loading && <p className="text-gray-300">Loading...</p>}

      {/* Tag Input */}
      <div className="flex space-x-2 mt-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag..."
          className="bg-gray-700 text-white px-2 py-1 rounded"
        />
      </div>

      {/* Comment Input */}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment..."
        className="bg-gray-700 text-white w-full p-2 rounded mt-2"
      />

      {/* Save Button */}
      <button
        onClick={handleAddTagOrComment}
        className="bg-blue-500 px-3 py-1 rounded text-white mt-2"
      >
        💾 Save Tag/Comment
      </button>

      {/* Tags List */}
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-300">Tags:</h4>
        {tags.length > 0 ? (
          <ul className="text-gray-400">
            {tags.map((tag, index) => (
              <li
                key={index}
                className="bg-gray-700 inline-block px-2 py-1 rounded mr-2 mt-1"
              >
                #{tag}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No tags added yet.</p>
        )}
      </div>

      {/* Comments List */}
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-300">Comments:</h4>
        {comments.length > 0 ? (
          <ul className="text-gray-400">
            {comments.map((comment, index) => (
              <li key={index} className="bg-gray-700 p-2 rounded mt-1">
                <strong className="text-gray-200">{comment.user}:</strong>{" "}
                {comment.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No comments added yet.</p>
        )}
      </div>
    </div>
  );
}

export default FileCommentsAndTags;
