 async function officerLogin() {
  const username = document.getElementById("officerUsername").value.trim();
  const password = document.getElementById("officerPassword").value.trim();

  if (!username || !password) {
    showToast('warning', 'Missing Information', 'Please fill all fields');
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/officer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem("officer", "true");
      localStorage.setItem("username", username);
      showToast('success', 'Officer Login', `Welcome, ${username}!`);
      
      setTimeout(() => {
        window.location.href = "officer-dashboard.html";
      }, 1500);
    } else {
      showToast('error', 'Access Denied', data.message || 'Invalid officer credentials');
    }
  } catch (error) {
    showToast('error', 'Connection Error', 'Unable to connect to server');
  }
}
