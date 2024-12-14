import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClQbocAaDYMeBeAywa1M5ZSVo8FBYzMnI",
  authDomain: "document-control-software.firebaseapp.com",
  projectId: "document-control-software",
  storageBucket: "document-control-software.firebasestorage.app",
  messagingSenderId: "439523648378",
  appId: "1:439523648378:web:f992f770a69db434332cc3",
  measurementId: "G-TK01LMMMN1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const storage = getStorage(app);
const db = getFirestore(app);

export { auth, db };