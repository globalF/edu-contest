import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { app, db } from "./firebase"; // ensure firebase.js exports `app`

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      setMessage(`Welcome back, ${user.email}! Redirecting...`);
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setMessage("User not found. Please register.");
      } else if (err.code === "auth/wrong-password") {
        setMessage("Invalid password.");
      } else if (err.code === "auth/invalid-email") {
        setMessage("Invalid email format.");
      } else {
        setMessage("Error logging in.");
      }
    }
  };

  // ✅ Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in DB
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // Save new Google user profile
        await set(userRef, {
          username: user.displayName || "Google User",
          email: user.email,
          subscribed: false,
          balance: 0,
          role: "student",
          created_at: Date.now(),
        });
      }

      setMessage("Google login successful! Redirecting...");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Google login error:", err);
      setMessage("Google login failed: " + err.message);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>Login</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>

        {/* Google Sign-In button */}
        <button onClick={handleGoogleLogin} style={googleButtonStyle}>
          Continue with Google
        </button>

        {/* Feedback message */}
        <p style={{ marginTop: "15px", color: "#333" }}>{message}</p>

        {/* Registration link */}
        <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#4CAF50", fontWeight: "bold", textDecoration: "none" }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

// 🎨 Styles
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #4CAF50, #2196F3)",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
  width: "400px",
  textAlign: "center",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "30px",
  border: "none",
  backgroundColor: "#2196F3",
  color: "#fff",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "transform 0.2s",
};

const googleButtonStyle = {
  marginTop: "15px",
  padding: "12px",
  borderRadius: "30px",
  border: "none",
  backgroundColor: "#DB4437",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Login;
