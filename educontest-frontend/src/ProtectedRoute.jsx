import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

function ProtectedRoute({ children }) {
  const auth = getAuth(app);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    // While Firebase restores session, show a loader or placeholder
    return <p>Loading...</p>;
  }

  if (!user) {
    // If no user after restore, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected page
  return children;
}

export default ProtectedRoute;
