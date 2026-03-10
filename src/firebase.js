// src/firebase.js
import { initializeApp }  from "firebase/app";
import { getFirestore }   from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOEvGG07TPAwLuFHmapmZZeiKvnDXj9k",
  authDomain: "mariage-app-60dae.firebaseapp.com",
  projetId: "mariage-app-60dae",
  stockageBucket: "mariage-app-60dae.firebasestorage.app",
  messagerieSenderId: "378349555958",
  AppId: "1:378349555958:web:73ec2de5360ef414a99cd7",
  mesureId: "G-C7JS0VYF7J"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);