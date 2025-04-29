// In this JS file, swal is a keyword from sweetalert.js used instead of the alert keyword.

// Resetting browser storage values
sessionStorage.setItem('proceedFromHomeButtonOnly', false);
sessionStorage.setItem('faceVerified', false);
sessionStorage.setItem('payFromFacePageOnly', false);

// Check if the user is already logged in
let currentUser = null;
const keepLoggedIn = localStorage.getItem("keepLoggedIn"); 

function getUserName() {
    if (keepLoggedIn === "yes") {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } else {
        currentUser = JSON.parse(sessionStorage.getItem('user'));
    }
}
getUserName();

if (currentUser) {
    swal("Already Logged In!", "Log Out first to continue.", "warning").then(() => {
        window.location.replace('../index.html');
    });
}

//----------------------------------------- The References --------------------------------------------//

const email = document.getElementById('emailInp');
const pass = document.getElementById('passInp');
const submit = document.getElementById('submitBtn');

//----------------------------------------- VALIDATION -----------------------------------------------//

function isEmptyOrSpaces(str) {
    return str == null || str.trim() === "";
}

function validateInput() {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (isEmptyOrSpaces(email.value) || isEmptyOrSpaces(pass.value)) {
        swal("", "You cannot leave any field empty!", "warning");
        return false;
    }

    if (!emailRegex.test(email.value)) {
        swal("", "Enter a valid email!", "warning");
        return false;
    }

    return true; 
}

//--------------------------------------- AUTHENTICATION PROCESS --------------------------------------//

async function authenticateUser() {
    if (!validateInput()) return;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.value,
                password: pass.value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            swal("", result.message || "Authentication failed!", "warning");
            return;
        }

        loginUser(result.user);
    } catch (error) {
        console.error("Error:", error);
        swal("Error!", "Something went wrong. Please try again later.", "error");
    }
}

//------------------------------------------ LOGIN ------------------------------------------------------//

function loginUser(user) {
    const keepLoggedIn = document.getElementById('customSwitch1').checked;

    if (!keepLoggedIn) {
        sessionStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.setItem('keepLoggedIn', 'yes');
        localStorage.setItem('user', JSON.stringify(user));
    }

    

    const userrole=JSON.parse(sessionStorage.getItem('user')).role;

    if (userrole === "admin") {
        window.location.replace("/src/dashboard.html");
    }else{
        window.location.replace("/src/profile.html");
        
    }

}

//------------------------------------ ASSIGN THE EVENTS -----------------------------------------//
submit.addEventListener('click', authenticateUser);
