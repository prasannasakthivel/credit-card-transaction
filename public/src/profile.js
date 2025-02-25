// Resetting browser storage values
sessionStorage.setItem('proceedFromHomeButtonOnly', false);
sessionStorage.setItem('faceVerified', false);
sessionStorage.setItem('payFromFacePageOnly', false);

// Helper functions for HTML navigation
const clickSaveBtn = () => (window.location.href = '../index.html');
const clickLogoImg = () => (window.location.href = '../index.html');

document.getElementById('logo').addEventListener('click', clickLogoImg);
document.getElementById('save-btn').addEventListener('click', clickSaveBtn);

//----------------------------------------- Profile Image Box Script --------------------------------------------//
const imgContainer = document.querySelector('.photo-container');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');
const uploadMessage = document.getElementById('upload-text');
const saveBtn = document.getElementById('save-btn');

// Show upload button on hover
imgContainer.addEventListener('mouseenter', () => (uploadBtn.style.display = "block"));
imgContainer.addEventListener('mouseleave', () => (uploadBtn.style.display = "none"));

//----------------------------------------- Fetching User Data --------------------------------------------//
let currentUser = null;
const keepLoggedIn = localStorage.getItem("keepLoggedIn");

function getUserData() {
    currentUser = keepLoggedIn === "yes"
        ? JSON.parse(localStorage.getItem('user'))
        : JSON.parse(sessionStorage.getItem('user'));
}
getUserData();

// Redirect to login if not authenticated
if (!currentUser) {
    swal("Login First!", "To view profile, Please Log In!\n\nPressing 'OK' will redirect you to log in.", "warning")
        .then(() => (window.location.href = "./login.html"));
} else {
    const { fullname, email, username, phone, profileImgURL } = currentUser;
    document.getElementById('name').innerText = fullname;
    document.getElementById('email').innerText = email;
    document.getElementById('username').innerText = username;
    document.getElementById('phone').innerText = phone;
    document.getElementById('payid').innerText = phone + "@facepay";
    img.src = profileImgURL || "../images/profileM.jpg";
}

//----------------------------------------- Image Uploading Process --------------------------------------------//
let chosenImageToUpload = null;

file.addEventListener('change', function () {
    const imageChosen = this.files[0];
    if (!imageChosen) return;

    chosenImageToUpload = imageChosen;
    const reader = new FileReader();
    reader.onload = () => img.setAttribute('src', reader.result);
    reader.readAsDataURL(imageChosen);

    uploadProcess();
});

//----------------------------------------- Upload Image to Backend --------------------------------------------//
const uploadProcess = async () => {
    if (!chosenImageToUpload || !currentUser || !currentUser.email) {
        return swal("No image selected or user not logged in!", "", "error");
    }

    const formData = new FormData();
    formData.append("image", chosenImageToUpload);
    formData.append("email", currentUser.email);

    uploadMessage.classList.replace('hide', 'unhide');
    uploadMessage.innerText = "* * Uploading... * *";
    saveBtn.classList.replace('unhide', 'hide');

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload. Server error.");
        }

        const result = await response.json();
        updateProfileImage(result.imageUrl);
        swal("Photo uploaded successfully!", "", "success");
    } catch (error) {
        console.error("Upload failed:", error);
        swal("Image not uploaded!", error.message, "error");
    } finally {
        uploadMessage.classList.replace('unhide', 'hide');
        saveBtn.classList.replace('hide', 'unhide');
    }
};

//----------------------------------------- Update User Profile Image --------------------------------------------//
const updateProfileImage = (imageUrl) => {
    if (!currentUser) return;
    
    currentUser.profileImgURL = imageUrl;

    if (keepLoggedIn === "yes") {
        localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('user', JSON.stringify(currentUser));
    }

    img.setAttribute('src', imageUrl);
};
