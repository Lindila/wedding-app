// src/firebase.js
import { initializeApp }  from "firebase/app";
import { getFirestore }   from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCOEvGG07TPAwLuFHmapmhZZeiKvnDXj9k",
  authDomain:        "wedding-app-60dae.firebaseapp.com",
  projectId:         "wedding-app-60dae",
  storageBucket:     "wedding-app-60dae.firebasestorage.app",
  messagingSenderId: "378349555958",
  appId:             "1:378349555958:web:73ec2de5360ef414a99cd7",
  measurementId:     "G-C7JS0VYF7J"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);