import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase"; // ensure firebase.js exports `app`

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Firebase logout
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "color 0.2s",
  };

  const activeStyle = {
    color: "#FFD700", // gold highlight
    borderBottom: "2px solid #FFD700",
  };

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #4CAF50, #2196F3)",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo / Platform Name */}
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>ScrambleNaija</h1>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "20px" }}>
        <NavLink
          to="/home"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/history"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          History
        </NavLink>
        <NavLink
          to="/winners"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          Winners
        </NavLink>
        <NavLink
          to="/subscription"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          Subscription
        </NavLink>
        <NavLink
          to="/profile"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/withdrawal"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...activeStyle } : linkStyle
          }
        >
          Withdrawal
        </NavLink>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const logoutButtonStyle = {
  backgroundColor: "#FF5722",
  border: "none",
  borderRadius: "8px",
  padding: "8px 16px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "transform 0.2s",
};

export default Navbar;
