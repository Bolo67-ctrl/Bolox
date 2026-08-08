import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuq6ZWXHiaIj-D-KKdDXlAwJY2zoW2GTo",
  authDomain: "bolo-e1529.firebaseapp.com",
  projectId: "bolo-e1529",
  storageBucket: "bolo-e1529.firebasestorage.app",
  messagingSenderId: "209481792399",
  appId: "1:209481792399:web:963d15a3b314959b00a9fa",
};

const app = initializeApp(firebaseConfig);

/* AUTH */

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

export const loginWithGoogle = () =>
  signInWithPopup(
    auth,
    googleProvider
  );

export const logoutUser = () =>
  signOut(auth);

/* FIRESTORE */

export const db =
  getFirestore(app);

export default app;