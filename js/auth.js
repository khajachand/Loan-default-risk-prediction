// const AUTH_API = "http://127.0.0.1:5000/api/auth";

// /* =========================
//    USER REGISTER
// ========================= */
// async function register() {
//   const username = document.getElementById("regUsername").value;
//   const password = document.getElementById("regPassword").value;

//   if (!username || !password) {
//     alert("Please fill all fields");
//     return;
//   }

//   const res = await fetch(`${AUTH_API}/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       username: username,
//       password: password,
//       role: "USER"
//     })
//   });

//   const data = await res.json();
//   alert(data.message);

//   if (res.status === 201) {
//     window.location.href = "login.html";
//   }
// }

// /* =========================
//    USER LOGIN
// ========================= */
// async function login() {
//   const username = document.getElementById("loginUsername").value;
//   const password = document.getElementById("loginPassword").value;

//   if (!username || !password) {
//     alert("Please fill all fields");
//     return;
//   }

//   const res = await fetch(`${AUTH_API}/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password })
//   });

//   const data = await res.json();

//   if (res.status === 200) {
//     // 🔥 STORE LOGIN SESSION
//     localStorage.setItem("user_id", data.user_id);
//     localStorage.setItem("role", data.role);

//     // REDIRECT BASED ON ROLE
//     if (data.role === "OFFICER") {
//       window.location.href = "officer-dashboard.html";
//     } else {
//       window.location.href = "user-dashboard.html";
//     }
//   } else {
//     alert(data.message);
//   }
// }

// /* =========================
//    LOGOUT (COMMON)
// ========================= */
// function logout() {
//   localStorage.clear();
//   window.location.href = "login.html";
// }





// auth.js - Clean version without duplicates
const AUTH_API = "http://127.0.0.1:5000/api/auth";

/* =========================
   USER REGISTER
========================= */
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!username || !password) {
    showToast('warning', 'Missing Information', 'Please fill all fields');
    return;
  }

  if (password.length < 6) {
    showToast('warning', 'Weak Password', 'Password must be at least 6 characters');
    return;
  }

  try {
    const res = await fetch(`${AUTH_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
        role: "USER"
      })
    });

    const data = await res.json();

    if (res.status === 201) {
      showToast('success', 'Registration Successful', 'Redirecting to login...');
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      showToast('error', 'Registration Failed', data.message || 'User already exists');
    }
  } catch (error) {
    showToast('error', 'Connection Error', 'Unable to connect to server');
  }
}

/* =========================
   USER LOGIN
========================= */
async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) {
    showToast('warning', 'Missing Information', 'Please fill all fields');
    return;
  }

  try {
    const res = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.status === 200) {
      // Store login session
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", username);

      showToast('success', 'Login Successful', `Welcome back, ${username}!`);

      setTimeout(() => {
        // Redirect based on role
        if (data.role === "OFFICER") {
          window.location.href = "officer-dashboard.html";
        } else {
          window.location.href = "user-dashboard.html";
        }
      }, 1500);
    } else {
      showToast('error', 'Login Failed', data.message || 'Invalid credentials');
    }
  } catch (error) {
    showToast('error', 'Connection Error', 'Unable to connect to server');
  }
}

/* =========================
   LOGOUT (COMMON)
========================= */
function logout() {
  const username = localStorage.getItem("username") || "User";
  localStorage.clear();
  showToast('info', 'Logged Out', `Goodbye, ${username}!`);
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}
