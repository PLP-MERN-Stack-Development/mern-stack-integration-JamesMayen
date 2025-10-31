import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create context
export const AuthContext = createContext();

// Provider component
export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile from backend
  const fetchUser = async (token) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unauthorized");
      // Normalize user shape so rest of app can rely on `user.id`
      const u = data.user || {};
      const normalized = {
        id: u.id || u._id || u._id?.toString?.() || u.id?.toString?.(),
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      };
      setUser(normalized);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    // normalize inputs to avoid mismatches (trim and lowercase email)
    const payload = {
      email: String(email || "").trim().toLowerCase(),
      password: String(password || "").trim(),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("token", data.token);
    // login endpoint already returns user with `id`, normalize just in case
    const lu = data.user || {};
    setUser({ id: lu.id || lu._id, name: lu.name, email: lu.email });
    navigate("/dashboard");
  };

  // Register function
  const register = async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    navigate("/login");
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
