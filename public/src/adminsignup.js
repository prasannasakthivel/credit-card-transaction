// admin_signup.js
document.getElementById("sub_btn").addEventListener("click", async () => {
    const fullname = document.getElementById("nameInp").value.trim();
    const email = document.getElementById("emailInp").value.trim();
    const username = document.getElementById("userInp").value.trim();
    const phone = document.getElementById("phoneInp").value.trim();
    const password = document.getElementById("passInp").value.trim();
  
    if (!fullname || !email || !username || !phone || !password) {
      return swal("Error", "Please fill in all fields", "error");
    }
  
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullname,
        email,
        username,
        phone,
        password,
        role: "admin"
      })
    });
  
    const data = await res.json();
  
    if (res.status === 201) {
      swal("Success", data.message, "success").then(() => {
        window.location.href = "./login.html";
      });
    } else {
      swal("Error", data.message || "Something went wrong", "error");
    }
  });
  