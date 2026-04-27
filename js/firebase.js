import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDxaSPwNAG9o5t2EmImCyr6qQb8rySGqY",
  authDomain: "consorcio-app-fbef2.firebaseapp.com",
  projectId: "consorcio-app-fbef2",
  storageBucket: "consorcio-app-fbef2.appspot.com",
  messagingSenderId: "1029360209160",
  appId: "1:1029360209160:web:f3b93739c21659e0cdb0bd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);