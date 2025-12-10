// -----------------------------
// script.js - FINAL VERSION
// -----------------------------

// Firebase Config -------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAVX30uedkNsKSYoIBOapf7ta5WDM6s2r0",
    authDomain: "expense-tracker-f5882.firebaseapp.com",
    projectId: "expense-tracker-f5882",
    storageBucket: "expense-tracker-f5882.appspot.com",
    messagingSenderId: "367190631621",
    appId: "1:367190631621:web:d6da7360052cd98c627cac"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Global state ----------------------------
let currentUser = null;
let monthlyLimit = 0;
let totalSpent = 0;

// Helpers --------------------------------
const id = (x) => document.getElementById(x);

function formatCurrency(n) {
    return `₹${Number(n).toFixed(2)}`;
}

function formatDate(ts) {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
}

function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// MAIN LOGIC ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn          = id("logoutBtn");
    const saveLimitBtn       = id("saveLimitBtn");
    const addExpenseBtn      = id("addExpenseBtn");

    const limitInput         = id("limitInput");
    const descInput          = id("descInput");
    const amountInput        = id("amountInput");
    const categoryInput      = id("categoryInput");

    const expenseList        = id("expenseList");
    const categoryTotalsBox  = id("categoryTotalsBox");

    const remainingDisplay   = id("remainingDisplay");
    const warningMessage     = id("warningMessage");

    // ----------------- Auth Listener ------------------
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "index.html";
            return;
        }
        currentUser = user.uid;

        listenToUserData();
        listenToExpenses();
    });

    // ----------------- Logout -------------------------
    logoutBtn.addEventListener("click", async () => {
        try {
            await auth.signOut();
            window.location.href = "index.html";
        } catch (e) {
            alert("Logout failed: " + e.message);
        }
    });

    // ----------------- Save Monthly Limit -------------
    saveLimitBtn.addEventListener("click", async () => {
        const limit = Number(limitInput.value);

        if (!limit || limit <= 0) {
            alert("Enter a valid monthly limit!");
            return;
        }

        const ref = db.collection("users").doc(currentUser);
        const docSnap = await ref.get();

        const thisMonth = currentMonthKey();
        const prevMonth = docSnap.exists ? docSnap.data().limitMonth : null;

        if (prevMonth === thisMonth) {
            if (!confirm("Limit already set for this month. Overwrite?")) return;
        }

        await ref.set(
            {
                monthlyLimit: limit,
                limitMonth: thisMonth
            },
            { merge: true }
        );

        alert("Monthly limit saved!");
    });

    // ----------------- Add Expense ---------------------
    addExpenseBtn.addEventListener("click", async () => {
        const desc = descInput.value.trim();
        const amt  = Number(amountInput.value);
        const cat  = categoryInput.value.trim() || "Uncategorized";

        if (!desc || amt <= 0) {
            alert("Invalid description or amount!");
            return;
        }

        if (monthlyLimit && totalSpent + amt > monthlyLimit) {
            if (!confirm("This exceeds the monthly limit. Add anyway?")) return;
        }

        const ref = db.collection("users")
                      .doc(currentUser)
                      .collection("expenses");

        await ref.add({
            description: desc,
            amount: amt,
            category: cat,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        descInput.value = "";
        amountInput.value = "";
        categoryInput.value = "";
    });

    // ----------------- Listen to User Data (Limit) ----
    function listenToUserData() {
        db.collection("users")
            .doc(currentUser)
            .onSnapshot((doc) => {
                const data = doc.exists ? doc.data() : {};
                monthlyLimit = data.monthlyLimit || 0;
                limitInput.value = monthlyLimit || "";
                updateRemainingUI();
            });
    }

    // ----------------- Listen to Expenses --------------
    function listenToExpenses() {
        db.collection("users")
            .doc(currentUser)
            .collection("expenses")
            .orderBy("timestamp", "desc")
            .onSnapshot((snap) => {

                totalSpent = 0;
                expenseList.innerHTML = "";

                let categoryTotals = {};

                snap.forEach((doc) => {
                    const d = doc.data();
                    const amt = Number(d.amount);

                    totalSpent += amt;

                    const cat = d.category || "Uncategorized";
                    if (!categoryTotals[cat]) categoryTotals[cat] = 0;
                    categoryTotals[cat] += amt;

                    const item = document.createElement("div");
                    item.className = "expense-item";

                    item.innerHTML = `
                        <div class="expense-top">
                            <strong>${d.description}</strong> - ${formatCurrency(amt)}
                        </div>
                        <small class="expense-meta">
                            ${cat} • ${formatDate(d.timestamp)}
                        </small>
                        <div class="expense-actions">
                            <button class="delete-btn" data-id="${doc.id}">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                            <button class="paid-btn" data-id="${doc.id}">
                                <i class="fa-solid fa-circle-check"></i> Mark Paid
                            </button>
                        </div>
                    `;

                    expenseList.appendChild(item);
                });

                renderCategoryTotals(categoryTotals);
                updateRemainingUI();
                attachActionButtons();
            });
    }

    // ----------------- Render Category Totals ----------
    function renderCategoryTotals(catTotals) {
        categoryTotalsBox.innerHTML = "";

        if (Object.keys(catTotals).length === 0) {
            categoryTotalsBox.innerHTML = "<p>No expenses yet.</p>";
            return;
        }

        for (const cat in catTotals) {
            const row = document.createElement("div");
            row.innerHTML = `<strong>${cat}:</strong> ${formatCurrency(catTotals[cat])}`;
            categoryTotalsBox.appendChild(row);
        }
    }

    // ----------------- Update Remaining ----------------
    function updateRemainingUI() {
        const remaining = (monthlyLimit || 0) - totalSpent;

        remainingDisplay.textContent = `Remaining: ${formatCurrency(remaining)}`;

        if (remaining < 0) {
            warningMessage.textContent = "⚠ Monthly limit exceeded!";
            warningMessage.style.color = "red";
        } else {
            warningMessage.textContent = "";
        }
    }

    // ----------------- Attach Delete + Mark Paid -------
    function attachActionButtons() {

        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (confirm("Delete this expense?")) {
                    await db
                        .collection("users")
                        .doc(currentUser)
                        .collection("expenses")
                        .doc(id)
                        .delete();
                }
            };
        });

        document.querySelectorAll(".paid-btn").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                await db
                    .collection("users")
                    .doc(currentUser)
                    .collection("expenses")
                    .doc(id)
                    .delete();
            };
        });

    }
});
