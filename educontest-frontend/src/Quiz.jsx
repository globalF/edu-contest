import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { ref, onValue, push, set, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app, db } from "./firebase";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

function Quiz() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);
  const [showWinnerMessage, setShowWinnerMessage] = useState(null);
  const [userData, setUserData] = useState({ balance: 0 });
  const [activeCount, setActiveCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  // ✅ Check subscription status
  useEffect(() => {
    if (!userId) return;
    const subRef = ref(db, `subscriptions/${userId}`);
    onValue(subRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.expiry) {
        const now = Date.now();
        setSubscribed(now < data.expiry); // true if still valid
      } else {
        setSubscribed(false);
      }
    });
  }, [userId]);

  // Load contests and questions
  useEffect(() => {
    const contestRef = ref(db, "contests");
    onValue(contestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contests = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        const currentContest = contests.find((c) => !c.winner);
        setContest(currentContest);

        if (currentContest) {
          const endTime =
            currentContest.start_time + currentContest.timer_duration * 1000;
          const now = Date.now();
          setCountdown(Math.max(0, Math.floor((endTime - now) / 1000)));

          const questionsRef = ref(db, "questions");
          onValue(questionsRef, (qSnapshot) => {
            const qData = qSnapshot.val();
            if (qData) {
              const allQuestions = Object.entries(qData).map(([id, value]) => ({
                id,
                ...value,
              }));
              const contestQuestions = allQuestions.filter(
                (q) => q.contest_id === currentContest.id
              );
              setQuestions(contestQuestions);
            }
            setLoading(false);
          });
        }
      }
    });
  }, []);

  // ✅ Updated handleConfirm with subscription check
  const handleConfirm = async () => {
    if (!userId) {
      alert("You must be logged in to participate.");
      return;
    }

    if (!subscribed) {
      alert("You need an active subscription to play.");
      navigate("/subscription");
      return;
    }

    if (countdown > 0) {
      alert("Contest not ready yet!");
      return;
    }

    const currentQuestion = questions[currentIndex];
    if (
      answer.trim().toLowerCase() ===
      currentQuestion.correct_answer.trim().toLowerCase()
    ) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
      } else {
        // Final question correct → declare winner
        const contestWinnerRef = ref(db, `contests/${contest.id}/winner`);
        set(contestWinnerRef, userId);

        const newBalance = userData.balance + parseInt(contest.reward);
        setUserData({ ...userData, balance: newBalance });

        // ✅ Update balance in Firebase
        const userRef = ref(db, `users/${userId}/balance`);
        set(userRef, newBalance);

        // Save result entry
        const resultsRef = ref(db, "results");
        await push(resultsRef, {
          contest_id: contest.id,
          userId,
          score: questions.length,
          reward: contest.reward,
          submitted_at: Date.now(),
          is_winner: true,
        });

        setShowCongrats(true);
      }
    } else {
      alert("Incorrect answer, try again!");
    }
  };

    const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

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

      {/* Winner popup for current user */}
      {showCongrats && (
        <>
          <Confetti />
          {window.confirm("Congratulations, you have won!") &&
            navigate("/home")}
        </>
      )}

      {/* Winner popup for other users */}
      {showWinnerMessage && (
        <>
          {window.confirm(`${showWinnerMessage} has emerged the winner!`) &&
            navigate("/home")}
        </>
      )}

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
        {countdown > 0 ? (
          <p style={{ fontSize: "20px", color: "red", fontWeight: "bold" }}>
            Contest not ready yet. Please wait {Math.floor(countdown / 60)}:
            {String(countdown % 60).padStart(2, "0")}
          </p>
        ) : loading ? (
          <p>Loading questions...</p>
        ) : questions.length > 0 ? (
          <div>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>
              Round {contest?.round_number} — Reward: ₦{contest?.reward}
            </h3>

            <p style={{ marginBottom: "10px" }}>
              👥 Users currently in the contest: {activeCount}
            </p>

            <div
              style={{
                height: "20px",
                background: "#eee",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#4CAF50",
                  borderRadius: "10px",
                  transition: "width 0.3s",
                }}
              ></div>
            </div>

            <p
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#2196F3",
              }}
            >
              Question {currentIndex + 1} / {questions.length}
            </p>

            <p
              style={{
                fontSize: "20px",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              {questions[currentIndex].text}
            </p>

            <input
              type="text"
              placeholder="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: "20px",
              }}
            />

                        <button
              onClick={handleConfirm}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#FF9800",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              disabled={winner !== null}
            >
              {currentIndex === questions.length - 1 ? "Win" : "Confirm"}
            </button>

            <p
              style={{
                marginTop: "20px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Wallet Balance: ₦{userData.balance}
            </p>
          </div>
        ) : (
          <p>No questions available for this round.</p>
        )}
      </div>
    </div>
  );
}

export default Quiz;
