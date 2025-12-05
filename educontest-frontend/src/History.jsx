import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error fetching history", err));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4CAF50, #2196F3)",
        fontFamily: "Arial, sans-serif",
        padding: "30px",
      }}
    >
      {/* Navbar */}
      <Navbar />

      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
          width: "900px",
          margin: "30px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>
          My Contest History
        </h2>

        {/* History Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f2f5", color: "#333" }}>
              <th style={thStyle}>Contest</th>
              <th style={thStyle}>Round</th>
              <th style={thStyle}>Winner</th>
              <th style={thStyle}>Result</th>
              <th style={thStyle}>Finish Time</th>
              <th style={thStyle}>Reward Earned</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{item.contest_id || "—"}</td>
                  <td style={tdStyle}>{item.round_number}</td>
                  <td style={tdStyle}>{item.winner || "—"}</td>
                  <td style={tdStyle}>
                    {item.is_winner ? "Winner 🏆" : "Participated"}
                  </td>
                  <td style={tdStyle}>
                    {new Date(item.finish_time).toLocaleString()}
                  </td>
                  <td style={tdStyle}>₦{item.reward}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "20px", color: "#666" }}>
                  No contest history yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center",
};

const tdStyle = {
  padding: "12px",
  fontSize: "15px",
  textAlign: "center",
};

export default History;
