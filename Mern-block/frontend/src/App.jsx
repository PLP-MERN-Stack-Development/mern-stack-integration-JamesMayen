import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";  
import PostView from "./pages/PostView";
import CreateEditPost from "./pages/CreateEditPost";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// AllPosts and Chat are now embedded inside the Dashboard community section
export default function App() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto my-8 px-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateEditPost />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <CreateEditPost />
              </ProtectedRoute>
            }
          />
          <Route path="/post/:id" element={<PostView />} />
        </Routes>
      </main>
    </>
  );
}
