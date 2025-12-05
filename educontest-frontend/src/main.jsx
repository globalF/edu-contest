import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage";
import Registration from "./Registration";
import Login from "./Login";
import Home from "./Home";
import Quiz from "./Quiz";
import Admin from "./Admin";
import History from "./History";
import Winners from "./Winners";
import Subscription from "./Subscription";
import Profile from "./Profile";
import Withdrawal from "./Withdrawal";   // ✅ import your new page
import ProtectedRoute from "./ProtectedRoute";   // wrapper for auth
import { AuthProvider } from "./AuthContext";    // ✅ new context

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public student routes */}
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* Protected student routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/winners"
          element={
            <ProtectedRoute>
              <Winners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdrawal"
          element={
            <ProtectedRoute>
              <Withdrawal />
            </ProtectedRoute>
          }
        />

        {/* Admin route (can also be protected separately if needed) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
