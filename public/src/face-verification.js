//------------------------importing image from localStorage or RealTime Database-------------------------//
let currentUser;
let keepLoggedIn = localStorage.getItem("keepLoggedIn");
let proceedFromHomeButtonOnly = sessionStorage.getItem("proceedFromHomeButtonOnly");
let payFromFacePageOnly = sessionStorage.getItem("payFromFacePageOnly");
let referencedImageURL;

function getUserName() {
  if (keepLoggedIn === "yes") {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } else {
    currentUser = JSON.parse(sessionStorage.getItem("user"));
  }
}
getUserName();

if (currentUser) {
  referencedImageURL = currentUser.profileImgURL;

  if (proceedFromHomeButtonOnly === "false") {
    swal(
      "Before starting face verification, fill transaction details at the home page.",
      "Pressing 'OK' will redirect you to home.",
      "warning",
      { timer: 4000 }
    ).then(function () {
      window.location.href = "../index.html";
    });
  }
} else {
  swal(
    "Login First!",
    "To start face verification, Please Log In!\n\nPressing 'OK' will redirect you to log in.",
    "warning",
    { timer: 4000 }
  ).then(function (reply) {
    if (reply) window.location.href = "./login.html";
    else window.location.href = "../index.html";
  });
}

//--------------------------------------Declaration of Variables-----------------------------------------//
const message = document.getElementById("message");
const video = document.getElementById("videoElement");
const main = document.getElementById("main");
const startBtn = document.getElementById("start-btn");

const modelsSrc = "../models";

let faceMatcher;
let canvas;
let showStartBtn = true;
let faceLabel;
let faceScore;
let faceVerified;

// helper function for HTML file (face-verification.html)
const clickLogoImg = () => {
  window.location.href = "../index.html";
};

const clickStartBtn = () => {
  startFaceRecognition();
};

//-----------------------------------------face-verification--------------------------------------------//
message.innerText = "Starting Camera...";

// Loading Models with Error Handling
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri(modelsSrc),
  faceapi.nets.faceLandmark68Net.loadFromUri(modelsSrc),
  faceapi.nets.faceRecognitionNet.loadFromUri(modelsSrc),
])
  .then(startVideo)
  .catch((err) => console.error("Error loading models:", err));

// Getting Camera

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => (video.srcObject = stream))
    .catch((err) => console.error("Camera access error:", err));

  matchFace();
}

// Load and label images from Database
async function loadAndLabelImagesFromDB() {
  if (!referencedImageURL || referencedImageURL === "null") {
    console.error("Profile image not found.");
    swal("Update Profile!", "Please upload a profile picture before proceeding.", "warning").then(() =>
      window.location.href = "./profile.html"
    );
    return null;
  }

  try {
    console.log("Fetching image from:", referencedImageURL);
    const img = await faceapi.fetchImage(referencedImageURL);
    const detections = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      console.error("Face not detected in the reference image.");
      swal("Error!", "No face detected in the profile picture. Please upload a clear photo.", "error");
      return null;
    }

    return [new faceapi.LabeledFaceDescriptors("known", [detections.descriptor])];

  } catch (error) {
    console.error("Error processing reference image:", error);
    swal("Error!", "Unable to process reference image. Please try again.", "error");
    return null;
  }
}

// Face Matching Function
async function matchFace() {
  const labeledFaceDescriptors = await loadAndLabelImagesFromDB();
  if (!labeledFaceDescriptors) {
    console.error("No labeled face descriptors found.");
    return;
  }

  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  message.innerText = "Data Processed! and Camera Started!";
  
  setTimeout(() => {
    message.innerText = "To begin! Press 'Start Verification' below.";
    if (showStartBtn) startBtn.classList.replace("hide", "unhide");
    else
      swal("Something went wrong!", "Please refresh the page.", "error").then(function (reply) {
        if (reply) window.location.reload();
      });
  }, 1000);
}

// Start Face Recognition
async function startFaceRecognition() {
  if (canvas) canvas.remove();

  canvas = faceapi.createCanvasFromMedia(video);
  main.appendChild(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  const recognizing = async () => {
    try {
      const detections = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      if (!resizedDetections.length) {
        console.warn("Face is not detected in the video feed.");
        swal("Face not detected!", "Ensure better lighting and proper positioning.", "warning");
        return;
      }

      const descriptorResult = resizedDetections[0].descriptor;
      const result = faceMatcher.findBestMatch(descriptorResult);

      faceLabel = result.label;
      faceScore = result.distance;

      const box = resizedDetections[0].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box);
      drawBox.draw(canvas);

      makePayment();

    } catch (error) {
      console.error("Error during face recognition:", error);
      swal("Error!", "An error occurred during face verification. Please try again.", "error");
    }
  };
  
  recognizing();
}

// Payment Function
function makePayment() {
  payFromFacePageOnly = true;
  
  if (faceLabel === "known" && faceScore <= 0.45) {
    faceVerified = true;
    swal(`${currentUser.fullname}, you are now verified!`, "Press the pay button to make payment.", "success");
    message.innerText = "Press the 'Pay' button to make payment.";
    startBtn.innerText = "Pay";
    startBtn.classList.add("pay-btn");
    startBtn.onclick = () => window.location.replace("./payment.html");
  } else {
    faceVerified = false;
    swal("Verification Failed!", "Face was not matched with the profile", "error").then(() => {
      window.location.replace("./payment.html");
    });
  }

  sessionStorage.setItem("payFromFacePageOnly", payFromFacePageOnly);
  sessionStorage.setItem("faceVerified", faceVerified);
}
