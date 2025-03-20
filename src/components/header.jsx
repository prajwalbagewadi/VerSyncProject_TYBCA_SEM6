import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        {/* Emoji as Logo */}
        <span className="text-2xl mr-2">🚀</span>

        {/* App Name */}
        <Link to="/" className="text-xl font-bold">
          MyApp
        </Link>
      </div>
    </header>
  );
}

export default Header;
