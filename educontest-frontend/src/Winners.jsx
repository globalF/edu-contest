import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import Navbar from "./Navbar";

function Winners() {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const resultsRef = ref(db, "results");
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        // Only keep entries that have reward and submitted_at (likely winners)
        const filtered = list.filter(item => item.reward && item.submitted_at);
        setWinners(filtered);
      } else {
        setWinners([]);
      }
    });
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
      <Navbar />

      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
          width: "700px",
          margin: "30px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#4CAF50" }}>Contest Winners</h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f2f5", color: "#333" }}>
              <th style={thStyle}>Winner</th>
              <th style={thStyle}>Reward</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {winners.length > 0 ? (
              winners.map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{w.userId}</td>
                  <td style={tdStyle}>₦{w.reward}</td>
                  <td style={tdStyle}>{new Date(w.submitted_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: "20px", color: "#666" }}>
                  No winners yet
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

export default Winners;
