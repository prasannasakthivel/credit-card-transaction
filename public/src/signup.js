// Reset browser storage values
sessionStorage.setItem('proceedFromHomeButtonOnly', false);
sessionStorage.setItem('faceVerified', false);
sessionStorage.setItem('payFromFacePageOnly', false);

// Check if user is already logged in
let currentUser = null;
let keepLoggedIn = localStorage.getItem("keepLoggedIn"); 
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

// Reference form fields
const name = document.getElementById('nameInp');
const email = document.getElementById('emailInp');
const username = document.getElementById('userInp');
const phone = document.getElementById('phoneInp');
const pass = document.getElementById('passInp');
const submit = document.getElementById('sub_btn');

// Validation function
function isEmptyOrSpaces(str) {
    return str == null || str.match(/^ *$/) !== null;
}

function Validation() {
    let nameregex = /^[a-zA-Z\s]+$/;
    let emailregex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let userregex = /^[a-zA-Z0-9]{3,}$/;
    let phoneregex = /^(\+\d{1,3}[- ]?)?[0]?\d{10}$/;
    
    if (isEmptyOrSpaces(name.value) || isEmptyOrSpaces(email.value) || isEmptyOrSpaces(username.value) || isEmptyOrSpaces(phone.value) || isEmptyOrSpaces(pass.value)) {
        swal("", "You cannot leave any field empty!", "warning");
        return false;
    }
    if (!nameregex.test(name.value)) {
        swal("", "The name should only contain alphabets!", "warning");
        return false;
    }
    if (!emailregex.test(email.value)) {
        swal("", "Enter a valid email!", "warning");
        return false;
    } 
    if (!userregex.test(username.value)) {
        swal("", "Username must be at least 3 characters long and alphanumeric.", "warning");
        return false;
    }
    if (!phoneregex.test(phone.value)) {
        swal("", "Enter a valid phone number!", "warning");
        return false;
    }
    return true; 
}

// Register user using MongoDB backend
function RegisterUser() {
    if (!Validation()) return;

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fullname: name.value,
            username: username.value,
            email: email.value,
            phone: phone.value,
            password: pass.value,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User registered successfully!") {
            swal("Success!", "Please login to continue.", "success").then(() => {
                window.location.replace("./login.html");
            });
        } else {
            swal("Error!", data.message, "error");
        }
    })
    .catch(error => swal("Error!", "Something went wrong!", "error"));
}

// Assign event listener
submit.addEventListener('click', RegisterUser);