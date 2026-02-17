const LOAN_API = "http://127.0.0.1:5000/api/loan";
const userId = localStorage.getItem("user_id");

// ========================================
// CHECK IF USER IS LOGGED IN
// ========================================
if (!userId) {
  showToast('warning', 'Session Expired', 'Please login again');
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

// ========================================
// DISPLAY USERNAME IN NAVBAR
// ========================================
const displayUsername = localStorage.getItem("username");
if (displayUsername) {
  document.getElementById("displayUsername").textContent = displayUsername;
} else {
  showToast('warning', 'Session Expired', 'Please login again');
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

console.log("Current User ID:", userId); // Debug log

// ========================================
// APPLY LOAN FUNCTION
// ========================================
async function applyLoan() {
  const age = parseInt(document.getElementById("age").value);
  const creditAmount = document.getElementById("creditAmount").value;
  const loanDuration = document.getElementById("loanDuration").value;
  const installmentRate = document.getElementById("installmentRate").value;
  const employmentDuration = document.getElementById("employmentDuration").value;
  const job = document.getElementById("job").value;

  // Validation
  if (!age || !creditAmount || !loanDuration || !installmentRate || !employmentDuration || job === '') {
    showToast('warning', 'Incomplete Form', 'Please fill all fields');
    return;
  }

  if (age < 18) {
    showToast('error', 'Age Restriction', 'You must be at least 18 years old to apply');
    return;
  }

  if (creditAmount <= 0) {
    showToast('warning', 'Invalid Amount', 'Please enter a valid loan amount');
    return;
  }

  const data = {
    user_id: parseInt(userId), // Make sure it's a number
    age: age,
    credit_amount: parseFloat(creditAmount),
    loan_duration: parseInt(loanDuration),
    installment_rate: parseFloat(installmentRate),
    employment_duration: parseFloat(employmentDuration),
    job: parseInt(job)
  };

  console.log("Submitting loan application:", data); // Debug log

  try {
    const res = await fetch(`${LOAN_API}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      showToast('success', 'Application Submitted', `Risk Level: ${result.ml_risk} - Under review`);
      
      // Clear form
      document.getElementById("age").value = '';
      document.getElementById("creditAmount").value = '';
      document.getElementById("loanDuration").value = '';
      document.getElementById("installmentRate").value = '';
      document.getElementById("employmentDuration").value = '';
      document.getElementById("job").value = '';
      
      // Reload applications immediately
      setTimeout(() => {
        loadApplications();
      }, 500);
    } else {
      showToast('error', 'Submission Failed', result.message || 'Please try again');
    }
  } catch (error) {
    console.error("Error submitting loan:", error);
    showToast('error', 'Connection Error', 'Unable to submit application');
  }
}

// ========================================
// LOAD USER APPLICATIONS
// ========================================
async function loadApplications() {
  console.log("Loading applications for user:", userId); // Debug log
  
  try {
    const res = await fetch(`${LOAN_API}/my-applications/${userId}`);
    const apps = await res.json();

    console.log("Received applications:", apps); // Debug log

    const container = document.getElementById("applications");
    container.innerHTML = "";

    if (!apps || apps.length === 0) {
      container.innerHTML = "<p style='opacity: 0.7; text-align: center; padding: 20px;'>No applications yet. Apply for your first loan!</p>";
      return;
    }

    apps.forEach(app => {
      const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Recently';

      container.innerHTML += `
        <div class="app-card">
          <p><b>Loan Amount:</b> ₹${parseFloat(app.loan_amount || app.credit_amount || 0).toLocaleString('en-IN')}</p>
          <p><b>Risk Level:</b> <span class="risk-${(app.ml_risk || 'Unknown').toLowerCase()}">${app.ml_risk || 'Unknown'}</span></p>
          <p><b>Applied:</b> ${createdDate}</p>
          <p class="status ${app.status}">${app.status}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading applications:', error);
    document.getElementById("applications").innerHTML = "<p style='opacity: 0.7; text-align: center; color: #ef4444;'>Error loading applications. Please refresh.</p>";
  }
}

// ========================================
// LOGOUT FUNCTION
// ========================================
function logout() {
  const username = localStorage.getItem("username") || "User";
  localStorage.clear();
  showToast('info', 'Logged Out', `Goodbye, ${username}!`);
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// ========================================
// AUTO REFRESH & INITIAL LOAD
// ========================================
loadApplications(); // Load immediately
setInterval(loadApplications, 5000); // Refresh every 5 seconds
