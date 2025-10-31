import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        Welcome to MERN Blog
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        A full-stack MERN blog application. Sign up or log in to start creating
        and reading posts.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
