import "./App.css";
import "./output.css";
import SignUp from "./components/signUp";
import Login from "./components/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import FolderList from "./components/SubfolderView";
import SubfolderView from "./components/SubfolderView";
import FileEditor from "./components/FileEditor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/subfolder/:repoName" element={<FolderList />} />
        <Route path="/file/*" element={<FileEditor />} />
      </Routes>
    </Router>
  );
}
export default App;
