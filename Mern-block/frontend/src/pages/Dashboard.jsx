import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Home from "./Home";
import AllPosts from "./AllPosts";
import Chat from "./Chat";
import api from "../api/apiClient";

function CommunityTabs() {
  const [active, setActive] = useState('chats');

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActive('chats')}
          className={`px-4 py-2 rounded-md ${active === 'chats' ? 'bg-white shadow text-gray-900' : 'bg-transparent text-gray-600 hover:bg-white'}`}
        >
          Chats
        </button>
        <button
          onClick={() => setActive('posts')}
          className={`px-4 py-2 rounded-md ${active === 'posts' ? 'bg-white shadow text-gray-900' : 'bg-transparent text-gray-600 hover:bg-white'}`}
        >
          Posts
        </button>
      </div>

      <div>
        {active === 'chats' ? (
          <Chat />
        ) : (
          <AllPosts />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true); // ✅ start as true
  const [profile, setProfile] = useState(null); // ✅ local profile state
  const [showCommunity, setShowCommunity] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(data.user);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-blue-600 text-lg font-medium animate-pulse">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600 text-lg font-medium">
          Unable to load profile. Please log in again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">📝 My Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      <main className="grow p-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome back, {profile.name} 👋
          </h2>

          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-medium">Email:</span> {profile.email}
            </p>
            <p>
              <span className="font-medium">Member since:</span>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Your Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/create')}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                ✏️ New Post
              </button>
              <button
                onClick={() => setShowCommunity(true)}
                className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                🌐 Community
              </button>
            </div>
          </div>

          {/* Personal posts (user's own posts) */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">My Posts</h3>
            <Home />
          </div>

          {/* Community is shown on demand (modal) */}
          {showCommunity && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            >
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-auto max-h-[90vh] p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Community</h3>
                  <button
                    onClick={() => setShowCommunity(false)}
                    aria-label="Close community"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <CommunityTabs />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white text-center py-4 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} MERN Blog | Built with ❤️ by James Mayen
      </footer>
    </div>
  );
}
