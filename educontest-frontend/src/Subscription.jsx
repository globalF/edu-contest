import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app, db } from "./firebase";
import Navbar from "./Navbar";

function Subscription() {
  const auth = getAuth(app);
  const user = auth.currentUser; // ✅ get logged-in user
  const userId = user ? user.uid : null;

  const [subscribed, setSubscribed] = useState(false);
  const [expiry, setExpiry] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Load subscription status from Firebase
  useEffect(() => {
    if (!userId) return; // safeguard if user not logged in
    const subRef = ref(db, `subscriptions/${userId}`);
    onValue(subRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.expiry) {
        setExpiry(data.expiry);
        const now = Date.now();
        if (now < data.expiry) {
          setSubscribed(true);
          setCountdown(Math.floor((data.expiry - now) / 1000));
        } else {
          setSubscribed(false);
          setCountdown(0);
        }
      }
    });
  }, [userId]);

  // Countdown updater
  useEffect(() => {
    if (subscribed && expiry) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          setSubscribed(false);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [subscribed, expiry]);

  // Save subscription to Firebase and deduct fee
const activateSubscription = async () => {
  if (!userId) return;

  const oneWeek = 604800 * 1000; // 7 days in ms
  const expiryTime = Date.now() + oneWeek;
  const subscriptionFee = 1000; // ₦1000 fee

  // ✅ Deduct fee from user's balance
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();

  if (userData && userData.balance >= subscriptionFee) {
    const newBalance = userData.balance - subscriptionFee;

    // Update subscription expiry and balance
    await set(ref(db, `subscriptions/${userId}`), { expiry: expiryTime });
    await set(ref(db, `users/${userId}/balance`), newBalance);

    setSubscribed(true);
    setExpiry(expiryTime);
  } else {
    alert("Insufficient balance to activate subscription.");
  }
};

// Inline Flutterwave Checkout
  const payWithFlutterwave = () => {
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-646eda21d95d31a0824d06525abc1179-X",
      tx_ref: Date.now(),
      amount: 1000,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: user?.email || "user@example.com",
        phonenumber: "08012345678",
        name: user?.displayName || "Test User",
      },
      customizations: {
        title: "ScrambleNaija Subscription",
        description: "Weekly Contest subscription",
        logo: "https://yourlogo.com/logo.png",
      },
      callback: (response) => {
        if (response.status === "successful") {
          activateSubscription();
        }
      },
      onclose: () => {},
    });
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
          width: "500px",
          margin: "30px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#2196F3" }}>
          Subscription Page
        </h2>

        {subscribed ? (
          <div>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              ✅ You are subscribed!
            </p>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
              Time remaining: {Math.floor(countdown / 3600)}h{" "}
              {Math.floor((countdown % 3600) / 60)}m {countdown % 60}s
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              Subscription required to enter quiz.
            </p>

            {/* Flutterwave Inline Button */}
            <button
              onClick={payWithFlutterwave}
              style={{
                padding: "12px 30px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2196F3",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Pay ₦1000 with Flutterwave
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscription;
