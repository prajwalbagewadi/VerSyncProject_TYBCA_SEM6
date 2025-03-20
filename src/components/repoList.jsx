import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaThumbtack } from "react-icons/fa";

// const NoteCard = ({
//   title,
//   date,
//   content,
//   tags,
//   onEdit,
//   onDelete,
//   isPinned,
// }) => {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div className="relative w-[300px] h-auto p-[3px] bg-gradient-to-br from-[#ff8a05] via-[#ff5478] to-[#ff00c6] rounded-lg transition hover:shadow-lg">
//       <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md transition hover:bg-gray-800">
//         <button
//           className={`absolute top-2 right-2 text-lg ${
//             isPinned ? "text-yellow-400" : "text-gray-400"
//           } hover:text-yellow-300`}
//           onClick={isPinned ? () => onEdit("unpin") : () => onEdit("pin")}
//         >
//           <FaThumbtack />
//         </button>

//         <h3 className="text-xl font-semibold">{title}</h3>
//         <p className="text-gray-400 text-sm">{date}</p>

//         <p className={`mt-2 text-gray-300 ${expanded ? "" : "line-clamp-2"}`}>
//           {content}
//         </p>
//         <button
//           className="text-blue-400 hover:text-blue-300 text-sm mt-2"
//           onClick={() => setExpanded(!expanded)}
//         >
//           {expanded ? "Show Less" : "Read More"}
//         </button>

//         <div className="flex flex-wrap mt-2 gap-2">
//           {tags?.map((tag, index) => (
//             <span key={index} className="bg-blue-500 px-2 py-1 text-xs rounded">
//               {tag}
//             </span>
//           ))}
//         </div>

//         <div className="flex justify-end mt-4 space-x-2">
//           <button
//             className="text-green-400 hover:text-green-300"
//             onClick={() => onEdit("edit")}
//           >
//             <FaEdit />
//           </button>
//           <button
//             className="text-red-400 hover:text-red-300"
//             onClick={onDelete}
//           >
//             <FaTrash />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const NoteCard = ({
  title,
  date,
  content,
  tags,
  onEdit,
  onDelete,
  isPinned,
  onClick, // Accept onClick as a prop
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative w-[300px] h-auto p-[3px] bg-gradient-to-br from-[#ff8a05] via-[#ff5478] to-[#ff00c6] rounded-lg transition hover:shadow-lg cursor-pointer"
      onClick={onClick} // Make the entire card clickable
    >
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md transition hover:bg-gray-800">
        {/* Pin Button */}
        <button
          className={`absolute top-2 right-2 text-lg ${
            isPinned ? "text-yellow-400" : "text-gray-400"
          } hover:text-yellow-300`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick for navigation
            isPinned ? onEdit("unpin") : onEdit("pin");
          }}
        >
          <FaThumbtack />
        </button>

        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm">{date}</p>

        <p className={`mt-2 text-gray-300 ${expanded ? "" : "line-clamp-2"}`}>
          {content}
        </p>
        <button
          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation when expanding text
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Show Less" : "Read More"}
        </button>

        <div className="flex flex-wrap mt-2 gap-2">
          {tags?.map((tag, index) => (
            <span key={index} className="bg-blue-500 px-2 py-1 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Edit & Delete Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="text-green-400 hover:text-green-300"
            onClick={(e) => {
              e.stopPropagation();
              onEdit("edit");
            }}
          >
            <FaEdit />
          </button>
          <button
            className="text-red-400 hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

// const RepoList = () => {
//   const [repos, setRepos] = useState([]);

//   useEffect(() => {
//     const fetchRepos = async () => {
//       try {
//         const response = await fetch("http://localhost:3000/repositories");
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setRepos(data);
//       } catch (error) {
//         console.error("Error fetching repositories:", error);
//       }
//     };
//     fetchRepos();
//   }, []);

//   return (
//     <div className="grid grid-cols-3 gap-4 p-5">
//       {repos.length > 0 ? (
//         repos.map((repo) => (
//           <NoteCard
//             //key={repo._id}
//             key={repo._id || repo.name}
//             title={repo.name}
//             className="cursor-pointer text-blue-500 hover:underline"
//             onClick={() => navigate(`/subfolders/${repo.name}`)}
//             date={new Date(repo.createdAt).toLocaleDateString()}
//             content={repo.description}
//             // tags={
//             //   [
//             //     ...new Set(repo.files?.map((file) => file.path.split("/")[0])),
//             //   ] || []
//             // }
//             tags={repo.files?.map((file) => file.originalName) || []}
//             //onEdit={() => console.log(`Edit ${repo.name}`)}

//             onDelete={() => console.log(`Delete ${repo.name}`)}
//             isPinned={false}
//           />
//         ))
//       ) : (
//         <p className="text-white text-lg">No repositories found.</p>
//       )}
//     </div>
//   );
// };

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
// import NoteCard from "./NoteCard"; // ✅ Import NoteCard

const RepoList = () => {
  const [repos, setRepos] = useState([]);
  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("http://localhost:3000/repositories");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    };
    fetchRepos();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-5">
      {repos.length > 0 ? (
        repos.map((repo) => (
          <NoteCard
            key={repo._id || repo.name}
            title={repo.name}
            date={new Date(repo.createdAt).toLocaleDateString()}
            content={repo.description}
            tags={repo.files?.map((file) => file.originalName) || []}
            isPinned={false}
            onEdit={(action) => console.log(`${action} ${repo.name}`)}
            onDelete={() => console.log(`Delete ${repo.name}`)}
            onClick={() => navigate(`/subfolder/${repo.name}`)} // ✅ Navigate correctly
          />
        ))
      ) : (
        <p className="text-white text-lg">No repositories found.</p>
      )}
    </div>
  );
};

export default RepoList;
