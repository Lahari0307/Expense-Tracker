// Firebase Config
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

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    // LOGIN
    loginBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
            window.location.href = "expense.html";
        } catch (e) {
            alert(e.message);
        }
    });

    // REGISTER
    registerBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert("Registration successful!");
        } catch (e) {
            alert(e.message);
        }
    });
});
