// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVX30uedkNsKSYoIBOapf7ta5WDM6s2r0",
  authDomain: "expense-tracker-f5882.firebaseapp.com",
  projectId: "expense-tracker-f5882",
  storageBucket: "expense-tracker-f5882.appspot.com",
  messagingSenderId: "367190631621",
  appId: "1:367190631621:web:d6da7360052cd98c627cac"
};
// Init Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to collection
const expensesCollection = collection(db, "expenses");

// Add new expense
window.addExpense = async function () {
  const name = document.getElementById("expenseName").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);

  if (!name || isNaN(amount)) {
    alert("Please enter a valid name and amount.");
    return;
  }

  try {
    await addDoc(expensesCollection, {
      name,
      amount,
      createdAt: new Date()
    });
    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    loadExpenses();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Load and display expenses
async function loadExpenses() {
  const expensesList = document.getElementById("expenses");
  expensesList.innerHTML = "";

  const snapshot = await getDocs(expensesCollection);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.name}: $${data.amount}`;
    expensesList.appendChild(li);
  });
}

// Load expenses on start
loadExpenses();
