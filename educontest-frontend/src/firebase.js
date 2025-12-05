// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB0Cf1ddGleb0EVRTL0zVkmjQfv4_YsnYI",
  authDomain: "quiz-app-e02a2.firebaseapp.com",
  databaseURL: "https://quiz-app-e02a2-default-rtdb.firebaseio.com",
  projectId: "quiz-app-e02a2",
  storageBucket: "quiz-app-e02a2.appspot.com",
  messagingSenderId: "992584046724",
  appId: "1:992584046724:web:590fb9302ff95b29cb8ad1"
};

// ✅ Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// ✅ Export initialized services
export { app };
export const db = getDatabase(app);
export const auth = getAuth(app);
