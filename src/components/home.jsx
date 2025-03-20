import { useState } from "react";
import NoteCard from "./noteCard";
import AddRepo from "./addrepo";
import RepoList from "./repoList";

const Home = () => {
  const [showCard, setShowCard] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [createdRepos, setCreatedRepos] = useState([]);

  // **Create Repository API Call**
  const handleCreateRepo = async () => {
    if (!repoName) return alert("Repository name is required.");

    try {
      const response = await axios.post("http://localhost:5000/api/repos", {
        name: repoName,
        description,
      });

      setCreatedRepos([...createdRepos, response.data.repo]);
      alert("Repository created successfully!");
      setRepoName("");
      setDescription("");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create repository.");
    }
  };

  // **Handle Folder Selection**
  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  // **Handle Folder Drag & Drop**
  const handleDrop = (event) => {
    event.preventDefault();
    const items = event.dataTransfer.items;
    const uploadedFiles = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].webkitGetAsEntry().isDirectory) {
          alert("Folders detected! Only files inside will be processed.");
        }
        const file = items[i].getAsFile();
        if (file) {
          uploadedFiles.push(file);
        }
      }
      setSelectedFiles((prev) => [...prev, ...uploadedFiles]);
    }
  };

  const handleCardToggle = () => {
    setShowCard((prev) => !prev); // This ensures we toggle the state correctly
  };

  // **Upload Folder to Repository**
  const handleUpload = async (repoName) => {
    if (!repoName) return alert("Create a repository first.");
    if (selectedFiles.length === 0) return alert("Select a folder to upload.");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      await axios.post(
        `http://localhost:3000/api/repos/${repoName}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Files uploaded successfully!");
      setSelectedFiles([]); // Clear selection
    } catch (error) {
      alert("Upload failed.");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold flex items-center space-x-2 justify-center">
        <span>🚀 VerSync</span>
      </h1>
      <p className="text-lg text-black mt-2">
        ⚡ Next-Gen Version Control System for Effortless Collaboration 🔥
      </p>
      <div className="bg-black min-h-screen flex justify-center p-4">
        <div className="w-full  flex flex-col">
          {/* Profile & Search Section */}
          <div className="flex flex-col bg-white p-4 rounded-2xl shadow-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src="https://i.pinimg.com/736x/1a/c1/97/1ac197277049388c147ecb96114cd84f.jpg"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover"
                />
                <div className="ml-4 text-gray-700">
                  <p className="font-semibold">Taro Sakamoto</p>
                  <p className="text-sm text-gray-500">View Profile</p>
                </div>
              </div>
              <button className="text-green-500 font-bold hover:text-green-600">
                Edit
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center bg-white border-2 border-black rounded-2xl shadow-lg p-2">
              <input
                type="text"
                className="w-full p-2 rounded-l-2xl outline-none text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                placeholder="Search..."
              />
              <select className="p-2 bg-gray-200 border-l border-gray-400 focus:ring-2 focus:ring-green-500">
                <option value="name">Name</option>
                <option value="date">Date</option>
                <option value="tag">Tag</option>
              </select>
              <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-r-2xl hover:bg-green-600 transition">
                🔍
              </button>
            </div>
          </div>

          {/* Add Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowCard(!showCard)}
              className="relative p-0.5 inline-flex items-center justify-center font-bold overflow-hidden group rounded-md w-full"
            >
              <span className="w-full h-full bg-gradient-to-br from-[#ff8a05] via-[#ff5478] to-[#ff00c6] group-hover:from-[#ff00c6] group-hover:via-[#ff5478] group-hover:to-[#ff8a05] absolute"></span>
              <span className="w-full relative px-6 py-3 transition-all ease-out bg-gray-900 rounded-md group-hover:bg-opacity-0 duration-400 text-center">
                <span className="relative text-white">Add Repos</span>
              </span>
            </button>
          </div>

          {/* New Repository Card */}
          {showCard && <AddRepo setShowCard={setShowCard} />}
          <div className="flex flex-row mt-2">
            <div className="ml-2 mr-2">
              <RepoList />
            </div>
            {/* <div className="ml-4 mr-2">
            <NoteCard />
          </div>
          <div className="ml-4 mr-2">
            <NoteCard />
          </div>
          <div className="ml-4 mr-2">
            <NoteCard />
          </div> */}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-10 text-center text-black">
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
};

export default Home;
