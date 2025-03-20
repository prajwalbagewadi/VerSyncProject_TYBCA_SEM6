import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import VerSync from "./VerSync";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = { email, password };

      console.log("Form Data to Send:", formData);

      const response = await axios.post(
        "http://localhost:3000/api/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json", // Ensure JSON is sent
          },
        }
      );

      console.log("Response from Server:", response);

      if (response.status === 200) {
        window.location.href = "/home";
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-md p-6 border-2 border-black rounded-lg shadow-md bg-white">
        <h1 className="text-4xl font-bold flex items-center space-x-2 justify-center">
          <span>🚀 VerSync</span>
        </h1>
        <p className="text-lg text-black mt-2">
          ⚡ Next-Gen Version Control System for Effortless Collaboration 🔥
        </p>
        <h1 className="text-xl font-bold text-center mb-4">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {" "}
          {/* ✅ Added onSubmit */}
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all"
          >
            Login
          </button>
          <p>
            Or Register{" "}
            <Link className="text-blue-600" to="/register">
              here.
            </Link>
          </p>
        </form>
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
}

export default Login;
