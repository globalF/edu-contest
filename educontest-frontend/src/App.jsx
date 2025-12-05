import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";   // ✅ import your firebase.js
import Quiz from "./Quiz";
import Home from "./Home";
import Congratulations from "./Congratulations";
import Login from "./Login";
import Registration from "./Registration";
import ProtectedRoute from "./ProtectedRoute"; // ✅ wrapper for protected pages

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    // ✅ Listen for login/logout events
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // cleanup listener
  }, [auth]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute user={user}>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/congratulations"
          element={
            <ProtectedRoute user={user}>
              <Congratulations />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
