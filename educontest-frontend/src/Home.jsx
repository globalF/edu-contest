import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";   // ✅ import db from firebase.js
import Navbar from "./Navbar";

function Home() {
  const [countdown, setCountdown] = useState(0);
  const [contest, setContest] = useState(null);
  const [user, setUser] = useState({ balance: 0, subscribed: false });
  const navigate = useNavigate();

  // ✅ Load contest data (global countdown from admin)
  useEffect(() => {
    const contestRef = ref(db, "contests");

    onValue(contestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contests = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        const currentContest = contests[0]; // pick first or latest
        setContest(currentContest);

        if (currentContest) {
          const endTime =
            currentContest.start_time + currentContest.timer_duration * 1000;
          const now = Date.now();
          setCountdown(Math.max(0, Math.floor((endTime - now) / 1000)));
        }
      }
    });
  }, []);

  // ✅ Countdown updater (global, synced for all users)
  useEffect(() => {
    if (contest) {
      const interval = setInterval(() => {
        const endTime =
          contest.start_time + contest.timer_duration * 1000;
        const now = Date.now();
        setCountdown(Math.max(0, Math.floor((endTime - now) / 1000)));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [contest]);

  // ✅ Load user subscription status (from Firebase)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const userRef = ref(db, `subscriptions/${userId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.expiry) {
        const now = Date.now();
        const subscribed = now < data.expiry;
        setUser((prev) => ({
          ...prev,
          subscribed,
        }));
      } else {
        setUser((prev) => ({ ...prev, subscribed: false }));
      }
    });
  }, []);

  const handleClick = () => {
    if (!user.subscribed) {
      alert("Please subscribe to enter");
      return;
    }
    if (countdown > 0) {
      alert("Contest not ready yet");
      return;
    }
    navigate("/quiz");
  };

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
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>
          Contest Dashboard
        </h2>

        {/* Wallet Balance */}
        <div
          style={{
            backgroundColor: "#f9f9f9",
            color: "#333",
            padding: "15px 30px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Wallet Balance: ₦{user.balance}
        </div>

        {/* Countdown Timer */}
        <div style={{ fontSize: "48px", marginBottom: "30px", color: "#333" }}>
          {!contest
            ? "No contest is available at the moment"
            : countdown > 0
              ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
              : "Contest is ongoing..."}
        </div>

        {/* Big Round Button */}
        <button
          onClick={handleClick}
          disabled={!contest || !user.subscribed || countdown > 0}
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            backgroundColor:
              !contest || !user.subscribed || countdown > 0
                ? "#ccc"
                : "#01992eff",
            color: "#fff",
            fontSize: "26px",
            fontWeight: "bold",
            border: "none",
            cursor:
              !contest || !user.subscribed || countdown > 0
                ? "not-allowed"
                : "pointer",
            boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) =>
            !contest || !user.subscribed || countdown > 0
              ? null
              : (e.target.style.transform = "scale(1.05)")
          }
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          {!contest ? "Wait" : countdown > 0 ? "Wait" : "Enter now"}
        </button>

        {/* Reward Display */}
        {contest && (
          <p
            style={{
              marginTop: "20px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Reward: ₦{contest.reward}
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
