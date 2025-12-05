import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Congratulations() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reward } = location.state || { reward: 0 };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4CAF50, #2196F3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#4CAF50", marginBottom: "20px" }}>🎉 Congratulations 🎉</h1>
        <p style={{ fontSize: "22px", fontWeight: "bold", color: "#333" }}>
          You have won ₦{reward}!
        </p>
        <button
          onClick={() => navigate("/quiz")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2196F3",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Play Next Contest
        </button>
      </div>
    </div>
  );
}

export default Congratulations;
