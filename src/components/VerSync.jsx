export default function VerSync() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold flex items-center space-x-2">
          <span>🚀 VerSync</span>
        </h1>
        <p className="text-lg text-gray-300 mt-2">
          ⚡ Next-Gen Version Control System for Effortless Collaboration 🔥
        </p>

        {/* CTA Button */}
        {/* <button className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg flex items-center space-x-2">
          <span>🚀 Get Started</span>
        </button> */}
      </div>

      {/* Footer Section */}
      <footer className="mt-10 text-center text-gray-400">
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
