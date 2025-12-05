import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set } from "firebase/database";
import { app, db } from "./firebase";

function Registration() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Password validation
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      // ✅ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ✅ Send email verification
      await sendEmailVerification(user);

      // ✅ Save extra user info in Realtime Database
      await set(ref(db, "users/" + user.uid), {
        username: formData.username,
        email: formData.email,
        subscribed: false,
        balance: 0,
        role: "student",
        created_at: Date.now(),
      });

      setMessage("Registration successful! Please check your email to verify your account.");
      // Redirect to login after a short delay
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setMessage("User already exists, please login.");
      } else {
        setMessage("Error registering user: " + err.message);
      }
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: "20px", color: "#4CAF50" }}>Register</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input type="text" name="username" placeholder="Username" value={formData.username}
            onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" placeholder="Email" value={formData.email}
            onChange={handleChange} required style={inputStyle} />
          <input type="password" name="password" placeholder="Password" value={formData.password}
            onChange={handleChange} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Register</button>
        </form>

        {/* Feedback message */}
        <p style={{ marginTop: "15px", color: "#333" }}>{message}</p>

        {/* Login link */}
        <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#2196F3", fontWeight: "bold", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

// 🎨 Styles
const pageStyle = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #4CAF50, #2196F3)", fontFamily: "Arial, sans-serif" };
const cardStyle = { backgroundColor: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 6px 12px rgba(0,0,0,0.2)", width: "400px", textAlign: "center" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" };
const buttonStyle = { padding: "12px", borderRadius: "30px", border: "none", backgroundColor: "#4CAF50", color: "#fff", fontSize: "18px", fontWeight: "bold", cursor: "pointer", transition: "transform 0.2s" };

export default Registration;
