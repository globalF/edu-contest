import React, { useState, useEffect } from "react";
import { ref, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app, db } from "./firebase";
import Navbar from "./Navbar";

function Withdrawal() {
  const auth = getAuth(app);
  const user = auth.currentUser; // ✅ get logged-in user
  const userId = user ? user.uid : null;

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  // Load user balance
  useEffect(() => {
    if (!userId) return;
    const userRef = ref(db, `users/${userId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.balance !== undefined) {
        setBalance(data.balance);
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
          .filter((w) => w.userId === userId); // only this user's requests
        setHistory(list);
      }
    });
  }, [userId]);

  const handleWithdraw = async () => {
    if (!userId) return;

    try {
      const withdrawalsRef = ref(db, "withdrawals");
      await push(withdrawalsRef, {
        userId,
        amount: Number(amount),
        status: "pending",
        created_at: Date.now(),
      });
      setMessage("Withdrawal request submitted successfully!");
      setAmount("");
    } catch (err) {
      console.error("Withdrawal error:", err);
      setMessage("Error submitting withdrawal request");
    }
  };

  // Validation
  const numericAmount = Number(amount);
  const isZeroOrNegative = numericAmount <= 0;
  const isAboveBalance = numericAmount > balance;
  const isEqualBalance = numericAmount === balance;

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
          width: "600px",
          margin: "30px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>
          Withdrawal Page
        </h2>

        {/* Wallet Balance */}
        <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          Wallet Balance: ₦{balance}
        </p>

        {/* Withdrawal Input */}
        <input
          type="number"
          placeholder="Enter withdrawal amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            marginBottom: "20px",
            width: "100%",
          }}
        />

        {/* Validation Messages */}
        {isZeroOrNegative && amount && (
          <p style={{ color: "red", marginBottom: "10px" }}>
            ❌ You cannot withdraw 0 or a negative amount.
          </p>
        )}
        {isAboveBalance && (
          <p style={{ color: "red", marginBottom: "10px" }}>
            ❌ You cannot withdraw above the amount in your wallet.
          </p>
        )}
        {!isZeroOrNegative && !isAboveBalance && !isEqualBalance && amount && (
          <p style={{ color: "orange", marginBottom: "10px" }}>
            ⚠️ You can only withdraw the exact wallet balance.
          </p>
        )}

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={isZeroOrNegative || !isEqualBalance || isAboveBalance}
          style={{
            padding: "12px 30px",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              !isZeroOrNegative && isEqualBalance && !isAboveBalance
                ? "#4CAF50"
                : "#ccc",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor:
              !isZeroOrNegative && isEqualBalance && !isAboveBalance
                ? "pointer"
                : "not-allowed",
          }}
        >
          Withdraw
        </button>

        {/* Feedback */}
        <p style={{ marginTop: "20px", color: "#333" }}>{message}</p>

        {/* Withdrawal History */}
        <h3 style={{ marginTop: "30px" }}>Withdrawal History</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((w) => (
              <tr
                key={w.id}
                style={{
                  backgroundColor:
                    w.status === "approved" ? "#e8f5e9" : "#fff3e0",
                }}
              >
                <td style={tdStyle}>₦{w.amount}</td>
                <td style={tdStyle}>{w.status}</td>
                <td style={tdStyle}>{new Date(w.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

export default Withdrawal;
