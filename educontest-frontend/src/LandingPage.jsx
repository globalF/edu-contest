import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function LandingPage() {
  const [contests, setContests] = useState([]);
  const navigate = useNavigate();

  // 🔹 Load all contests (ongoing + upcoming)
  useEffect(() => {
    const contestRef = ref(db, "contests");
    onValue(contestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contestList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setContests(contestList);
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
          width: "800px",
          margin: "30px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>
          Welcome to GREENGO Contest Platform
        </h2>

        {/* Login & Register Buttons */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "12px 24px",
              marginRight: "20px",
              backgroundColor: "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>

        {/* Contest List */}
        <h3 style={{ marginBottom: "20px", color: "#333" }}>
          Ongoing & Upcoming Contests
        </h3>
        {contests.length > 0 ? (
          contests.map((contest) => {
            const endTime =
              contest.start_time + contest.timer_duration * 1000;
            const now = Date.now();
            const countdown = Math.max(0, Math.floor((endTime - now) / 1000));

            return (
              <div
                key={contest.id}
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  textAlign: "left",
                }}
              >
                <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                  Contest: {contest.name || contest.id}
                </p>
                <p>Reward: ₦{contest.reward}</p>
                <p>
                  Status:{" "}
                  {countdown > 0 ? `Starts in ${countdown}s` : "Ongoing"}
                </p>
              </div>
            );
          })
        ) : (
          <p>No contests available at the moment.</p>
        )}

        {/* 🔹 How to Play Section */}
        <hr style={{ margin: "40px 0" }} />
        <h3 style={{ color: "#2196F3", marginBottom: "20px" }}>How to Play</h3>
        <ol
          style={{
            textAlign: "left",
            fontSize: "18px",
            lineHeight: "1.8",
            color: "#333",
          }}
        >
          <li>Register or log in to your GREENGO account.</li>
          <li>Subscribe to unlock contest participation.</li>
          <li>Check the countdown timer for the next contest.</li>
          <li>When the timer hits zero, click “Enter Quiz.”</li>
          <li>Answer all questions correctly to win coins and rewards.</li>
          <li>The first perfect finisher becomes the winner of the round.</li>
        </ol>
      </div>
    </div>
  );
}

export default LandingPage;
