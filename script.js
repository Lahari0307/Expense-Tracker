// Firebase CDN setup (uses global firebase object)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVX30uedkNsKSYoIBOapf7ta5WDM6s2r0",
  authDomain: "expense-tracker-f5882.firebaseapp.com",
  projectId: "expense-tracker-f5882",
  storageBucket: "expense-tracker-f5882.firebasestorage.app",
  messagingSenderId: "367190631621",
  appId: "1:367190631621:web:d6da7360052cd98c627cac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;

  try {
    await addDoc(collection(db, "expenses"), {
      amount,
      category,
      description,
      date,
      createdAt: serverTimestamp()
    });

    form.reset();
  } catch (err) {
    console.error("Error adding expense: ", err);
    alert("Failed to add expense");
  }
});

// Real-time listener
const expensesRef = collection(db, "expenses");
const q = query(expensesRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  list.innerHTML = "";
  let total = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.date} - ${data.category}: ₹${data.amount} — ${data.description}`;
    list.appendChild(li);

    total += data.amount;
  });

  totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;
});
