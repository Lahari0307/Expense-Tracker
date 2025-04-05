// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVX30uedkNsKSYoIBOapf7ta5WDM6s2r0",
  authDomain: "expense-tracker-f5882.firebaseapp.com",
  projectId: "expense-tracker-f5882",
  storageBucket: "expense-tracker-f5882.appspot.com",
  messagingSenderId: "367190631621",
  appId: "1:367190631621:web:d6da7360052cd98c627cac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add expense
window.addExpense = async function () {
  const name = document.getElementById("expenseName").value;
  const amount = document.getElementById("expenseAmount").value;

  if (!name || !amount) {
    alert("Please fill in all fields");
    return;
  }

  try {
    await addDoc(collection(db, "expenses"), {
      name: name,
      amount: parseFloat(amount),
      timestamp: new Date()
    });
    alert("Expense added successfully ✅");
    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    loadExpenses(); // refresh list
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Load expenses from Firestore
async function loadExpenses() {
  const expensesList = document.getElementById("expenses");
  expensesList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "expenses"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.name} - ₹${data.amount}`;
    expensesList.appendChild(li);
  });
}

// Load on page load
window.onload = loadExpenses;
