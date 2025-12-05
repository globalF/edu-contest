 import React, { useState, useEffect } from "react";
import { ref, push, onValue, remove, update } from "firebase/database";
import { db } from "./firebase";

function Admin() {
  const [contest, setContest] = useState({ round_number: "", reward: "", timer_duration: "" });
  const [questionData, setQuestionData] = useState({ contest_id: "", text: "", correct_answer: "" });
  const [message, setMessage] = useState("");
  const [contestsList, setContestsList] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [results, setResults] = useState([]); // 🔹 contest history

  // Load contests
  useEffect(() => {
    const contestRef = ref(db, "contests");
    onValue(contestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contests = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setContestsList(contests);

        // 🔹 Auto-delete contests that already have a winner
        contests.forEach((c) => {
          if (c.winner) {
            remove(ref(db, `contests/${c.id}`));
          }
        });
      }
    });
  }, []);

  // Load results (contest history)
  useEffect(() => {
    const resultsRef = ref(db, "results");
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setResults(list);
      }
    });
  }, []);

  // Delete contest
  const handleDeleteContest = async (id) => {
    try {
      await remove(ref(db, `contests/${id}`));
      setMessage("Contest deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Error deleting contest");
    }
  };

  // Delete history entry
  const handleDeleteHistory = async (id) => {
    try {
      await remove(ref(db, `results/${id}`));
      setMessage("History deleted successfully");
    } catch (err) {
      console.error("Delete history error:", err);
      setMessage("Error deleting history");
    }
  };

  // Contest form handlers
  const handleContestChange = (e) => {
    setContest({ ...contest, [e.target.name]: e.target.value });
  };

  const handleContestSubmit = async (e) => {
    e.preventDefault();
    try {
      const contestRef = ref(db, "contests");
      const newContest = await push(contestRef, {
        round_number: contest.round_number,
        reward: contest.reward,
        timer_duration: contest.timer_duration,
        start_time: Date.now()
      });
      setMessage(`Contest created successfully with ID: ${newContest.key}`);
      setContest({ round_number: "", reward: "", timer_duration: "" });
    } catch (err) {
      console.error("Contest error:", err);
      setMessage("Error creating contest");
    }
  };

  // Question form handlers
  const handleQuestionChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value });
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionsRef = ref(db, "questions");
      await push(questionsRef, {
        contest_id: questionData.contest_id,
        text: questionData.text,
        correct_answer: questionData.correct_answer
      });
      setMessage("Question added successfully");
      setQuestionData({ contest_id: "", text: "", correct_answer: "" });
    } catch (err) {
      console.error("Question error:", err);
      setMessage("Error adding question");
    }
  };

  // Approve withdrawal
  const handleApproveWithdrawal = async (withdrawal) => {
    try {
      const userRef = ref(db, `users/${withdrawal.userId}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const newBalance = (userData.balance || 0) - withdrawal.amount;
          update(userRef, { balance: newBalance });
        }
      }, { onlyOnce: true });

      const withdrawalRef = ref(db, `withdrawals/${withdrawal.id}`);
      await update(withdrawalRef, { status: "approved" });

      setMessage("Withdrawal approved and balance updated");
    } catch (err) {
      console.error("Approve error:", err);
      setMessage("Error approving withdrawal");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #4CAF50, #2196F3)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial, sans-serif", padding: "30px" }}>
      <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 6px 12px rgba(0,0,0,0.3)", width: "1000px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>Admin Dashboard</h2>

        {/* Contest Settings */}
        <form onSubmit={handleContestSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
          <input type="number" name="round_number" placeholder="Round Number" value={contest.round_number} onChange={handleContestChange} style={inputStyle} />
          <input type="text" name="reward" placeholder="Reward Amount" value={contest.reward} onChange={handleContestChange} style={inputStyle} />
          <input type="number" name="timer_duration" placeholder="Countdown Duration (seconds)" value={contest.timer_duration} onChange={handleContestChange} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Set Contest</button>
        </form>

        {/* Contest List with Delete */}
        <h3>Existing Contests</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Round</th>
              <th style={thStyle}>Reward</th>
              <th style={thStyle}>Duration (s)</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {contestsList.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.round_number}</td>
                <td style={tdStyle}>₦{c.reward}</td>
                <td style={tdStyle}>{c.timer_duration}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDeleteContest(c.id)} style={{ ...buttonStyle, backgroundColor: "#f44336" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Contest History */}
        <h3 style={{ marginTop: "30px" }}>Contest History</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Contest ID</th>
              <th style={thStyle}>Winner</th>
              <th style={thStyle}>Reward</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.contest_id}</td>
                <td style={tdStyle}>{r.userId}</td>
                <td style={tdStyle}>₦{r.reward}</td>
                <td style={tdStyle}>{r.score}</td>
                <td style={tdStyle}>{new Date(r.submitted_at).toLocaleString()}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDeleteHistory(r.id)} style={{ ...buttonStyle, backgroundColor: "#f44336" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

                {/* Subscribers */}
        <h3 style={{ marginTop: "30px" }}>Subscribers</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.userId}>
                <td style={tdStyle}>{s.userId}</td>
                <td style={tdStyle}>{new Date(s.expiry).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Withdrawals */}
        <h3 style={{ marginTop: "30px" }}>Withdrawal Requests</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id}>
                <td style={tdStyle}>{w.userId}</td>
                <td style={tdStyle}>₦{w.amount}</td>
                <td style={tdStyle}>{w.status}</td>
                <td style={tdStyle}>
                  {w.status === "pending" ? (
                    <button
                      onClick={() => handleApproveWithdrawal(w)}
                      style={{ ...buttonStyle, backgroundColor: "#2196F3" }}
                    >
                      Approve
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Feedback */}
        <p style={{ marginTop: "20px", color: "#333" }}>{message}</p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "transform 0.2s",
};

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

export default Admin;