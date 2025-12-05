// firebaseService.js
import { app, db, auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, set } from "firebase/database";

// Register user
export async function registerUser(username, email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await set(ref(db, "users/" + user.uid), {
    username,
    email,
    subscribed: false,
    balance: 0,
    role: "student",
    created_at: Date.now(),
  });
  return user;
}

// Login user
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Google login
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Save profile if new
  await set(ref(db, "users/" + user.uid), {
    username: user.displayName,
    email: user.email,
    subscribed: false,
    balance: 0,
    role: "student",
    created_at: Date.now(),
  });

  return user;
}
