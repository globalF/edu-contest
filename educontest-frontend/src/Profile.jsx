import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { app, db } from "./firebase";
import Navbar from "./Navbar";

function Profile() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Load user profile (username, email, balance)
  useEffect(() => {
    if (!userId) {
      setMessage("You must be logged in to view your profile.");
      return;
    }

    const userRef = ref(db, `users/${userId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile(data);
      }
    });
  }, [userId]);

  // Load subscription status
  useEffect(() => {
    if (!userId) return;
    const subRef = ref(db, `subscriptions/${userId}`);
    onValue(subRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.expiry) {
        const now = Date.now();
        setSubscription({
          active: now < data.expiry,
          expiry: new Date(data.expiry).toLocaleString(),
        });
      } else {
        setSubscription({ active: false, expiry: null });
      }
    });
  }, [userId]);

  // Load withdrawal history
  useEffect(() => {
    if (!userId) return;
    const withdrawalsRef = ref(db, "withdrawals");
    onValue(withdrawalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter((w) => w.userId === userId);
        setWithdrawals(list);
      }
    });
  }, [userId]);

  // Load contest participation history
  useEffect(() => {
    if (!userId) return;
    const resultsRef = ref(db, "results");
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter((r) => r.userId === userId);
        setHistory(list);
      }
    });
  }, [userId]);

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
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>My Profile</h2>

        {profile ? (
          <>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              <strong>Username:</strong> {profile.username}
            </p>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              <strong>Email:</strong> {profile.email}
            </p>
            <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              Wallet Balance: ₦{profile.balance}
            </p>

            {subscription?.active ? (
              <p style={{ color: "green", fontSize: "18px" }}>
                ✅ Subscribed until {subscription.expiry}
              </p>
            ) : (
              <p style={{ color: "red", fontSize: "18px" }}>
                ❌ Not subscribed — please renew
              </p>
            )}

            {/* Withdrawal History */}
            <h3 style={{ marginTop: "30px", color: "#2196F3" }}>Withdrawal History</h3>
            {withdrawals.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      style={{
                        backgroundColor:
                          w.status === "approved" ? "#e8f5e9" : "#fff3e0",
                      }}
                    >
                      <td style={tdStyle}>₦{w.amount}</td>
                      <td style={tdStyle}>{w.status}</td>
                      <td style={tdStyle}>
                        {new Date(w.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No withdrawals yet.</p>
            )}

            {/* Contest History */}
            <h3 style={{ marginTop: "30px", color: "#2196F3" }}>Contest History</h3>
            {history.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={thStyle}>Round</th>
                    <th style={thStyle}>Reward</th>
                    <th style={thStyle}>Result</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr
                      key={h.id}
                      style={{
                        backgroundColor: h.is_winner ? "#e8f5e9" : "#fff3e0",
                      }}
                    >
                      <td style={tdStyle}>{h.contest_id}</td>
                      <td style={tdStyle}>₦{h.reward}</td>
                      <td style={tdStyle}>
                        {h.is_winner ? "Winner 🎉" : "Participated"}
                      </td>
                      <td style={tdStyle}>
                        {new Date(h.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No contest history yet.</p>
            )}
          </>
        ) : (
          <p>{message || "Loading profile..."}</p>
        )}
      </div>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
};

export default Profile;
