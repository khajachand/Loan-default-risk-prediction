// const LOAN_API = "http://127.0.0.1:5000/api/loan";
// const AUTH_API = "http://127.0.0.1:5000/api/auth";

// // Display officer username
// const displayUsername = localStorage.getItem("username");
// if (displayUsername) {
//   document.getElementById("displayUsername").textContent = displayUsername;
// }

// // SAFETY CHECK
// if (localStorage.getItem("officer") !== "true") {
//   showToast('error', 'Unauthorized', 'Officer access only');
//   setTimeout(() => {
//     window.location.href = "officer-login.html";
//   }, 2000);
//   throw new Error("Not officer");
// }

// // Cache for usernames
// let userCache = {};
// let isLoading = false; // Prevent multiple simultaneous loads

// // ========================================
// // FETCH USERNAME BY USER ID
// // ========================================
// async function fetchUsername(userId) {
//   // Check cache first
//   if (userCache[userId]) {
//     return userCache[userId];
//   }
  
//   try {
//     // Try to fetch from backend
//     const res = await fetch(`${AUTH_API}/user/${userId}`);
//     if (res.ok) {
//       const data = await res.json();
//       userCache[userId] = data.username;
//       return data.username;
//     }
//   } catch (error) {
//     console.error('Error fetching username:', error);
//   }
  
//   // Fallback to User ID
//   return `User #${userId}`;
// }

// // ========================================
// // LOAD ALL LOAN APPLICATIONS
// // ========================================
// async function loadLoans() {
//   // Prevent multiple simultaneous loads
//   if (isLoading) {
//     console.log('Already loading, skipping...');
//     return;
//   }
  
//   isLoading = true;
  
//   try {
//     const res = await fetch(`${LOAN_API}/all`);
//     const loans = await res.json();

//     console.log('Loaded loans:', loans); // Debug log

//     const table = document.getElementById("loanTable");
    
//     if (!table) {
//       console.error('Loan table element not found');
//       isLoading = false;
//       return;
//     }

//     if (loans.length === 0) {
//       table.innerHTML = "<p style='text-align: center; opacity: 0.7; padding: 40px;'>No loan applications yet.</p>";
//       updateStats(0, 0, 0, 0);
//       isLoading = false;
//       return;
//     }

//     // Calculate stats
//     const pending = loans.filter(l => l.status === 'Pending').length;
//     const approved = loans.filter(l => l.status === 'Approved').length;
//     const rejected = loans.filter(l => l.status === 'Rejected').length;
//     updateStats(loans.length, pending, approved, rejected);

//     // Build HTML for all loans first
//     let htmlContent = '';

//     // Display each loan application
//     for (const loan of loans) {
//       const cardId = `loan-card-${loan.application_id}`;
      
//       // Get username - check multiple possible fields
//       let username = loan.username || loan.email || null;
      
//       // If not in loan data, try to fetch it
//       if (!username) {
//         username = await fetchUsername(loan.user_id);
//       }
      
//       // Safe data extraction with fallbacks
//       const age = loan.age || 'N/A';
//       const loanAmount = loan.loan_amount || loan.credit_amount || 0;
//       const loanDuration = loan.loan_duration || 'N/A';
//       const installmentRate = loan.installment_rate || 'N/A';
//       const employmentDuration = loan.employment_duration || 'N/A';
//       const job = loan.job !== undefined ? loan.job : 'N/A';
//       const mlRisk = loan.ml_risk || 'Unknown';
//       const status = loan.status || 'Pending';
//       const createdAt = loan.created_at || new Date().toISOString();
      
//       htmlContent += `
//         <div class="loan-card" id="${cardId}">
//           <!-- Main Info Row -->
//           <div class="loan-header" onclick="toggleDetails(${loan.application_id})">
//             <div class="loan-info">
//               <div class="loan-id">#${loan.application_id}</div>
//               <div class="loan-user">
//                 <span class="user-icon-small">👤</span>
//                 <span class="user-name">${username}</span>
//               </div>
//             </div>
            
//             <div class="loan-amount">
//               <span class="amount-label">Loan Amount</span>
//               <span class="amount-value">₹${parseFloat(loanAmount).toLocaleString()}</span>
//             </div>
            
//             <div class="loan-risk">
//               <span class="risk-badge ${mlRisk.toLowerCase()}">${mlRisk}</span>
//             </div>
            
//             <div class="loan-status-display">
//               <span class="status ${status}">${status}</span>
//             </div>
            
//             <div class="expand-icon" id="expand-${loan.application_id}">
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                 <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
//               </svg>
//             </div>
//           </div>

//           <!-- Detailed Info (Hidden by default) -->
//           <div class="loan-details" id="details-${loan.application_id}" style="display: none;">
//             <div class="details-grid">
//               <div class="detail-item">
//                 <span class="detail-label">📧 Email/Username</span>
//                 <span class="detail-value">${username}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">🎂 Age</span>
//                 <span class="detail-value">${age !== 'N/A' ? age + ' years' : 'N/A'}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">💰 Credit Amount</span>
//                 <span class="detail-value">₹${parseFloat(loanAmount).toLocaleString()}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">📅 Loan Duration</span>
//                 <span class="detail-value">${loanDuration !== 'N/A' ? loanDuration + ' months' : 'N/A'}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">📊 Installment Rate</span>
//                 <span class="detail-value">${installmentRate !== 'N/A' ? installmentRate + '%' : 'N/A'}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">💼 Employment Duration</span>
//                 <span class="detail-value">${employmentDuration !== 'N/A' ? employmentDuration + ' years' : 'N/A'}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">🏢 Job Type</span>
//                 <span class="detail-value">${getJobType(job)}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">🤖 ML Risk Assessment</span>
//                 <span class="detail-value risk-${mlRisk.toLowerCase()}">${mlRisk}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">📅 Applied On</span>
//                 <span class="detail-value">${new Date(createdAt).toLocaleString()}</span>
//               </div>
              
//               <div class="detail-item">
//                 <span class="detail-label">🔢 User ID</span>
//                 <span class="detail-value">#${loan.user_id}</span>
//               </div>
//             </div>
            
//             <!-- Action Buttons -->
//             <div class="action-buttons">
//               <button class="approve-btn" onclick="updateStatus(${loan.application_id}, 'Approved')" ${status !== 'Pending' ? 'disabled' : ''}>
//                 ✓ Approve Loan
//               </button>
//               <button class="reject-btn" onclick="updateStatus(${loan.application_id}, 'Rejected')" ${status !== 'Pending' ? 'disabled' : ''}>
//                 ✕ Reject Loan
//               </button>
//             </div>
//           </div>
//         </div>
//       `;
//     }
    
//     // Update table HTML once with all content
//     table.innerHTML = htmlContent;
    
//   } catch (error) {
//     showToast('error', 'Load Error', 'Unable to fetch loan applications');
//     console.error('Error loading loans:', error);
//   } finally {
//     isLoading = false;
//   }
// }

// // ========================================
// // TOGGLE DETAILS VIEW
// // ========================================
// function toggleDetails(applicationId) {
//   const details = document.getElementById(`details-${applicationId}`);
//   const expandIcon = document.getElementById(`expand-${applicationId}`);
  
//   if (details && expandIcon) {
//     if (details.style.display === 'none') {
//       details.style.display = 'block';
//       expandIcon.style.transform = 'rotate(180deg)';
//     } else {
//       details.style.display = 'none';
//       expandIcon.style.transform = 'rotate(0deg)';
//     }
//   }
// }

// // ========================================
// // GET JOB TYPE NAME
// // ========================================
// function getJobType(jobCode) {
//   if (jobCode === 'N/A' || jobCode === null || jobCode === undefined) {
//     return 'Not Specified';
//   }
  
//   const jobTypes = {
//     0: 'Unskilled',
//     1: 'Skilled Employee',
//     2: 'Highly Skilled',
//     3: 'Management'
//   };
//   return jobTypes[jobCode] || 'Not Specified';
// }

// // ========================================
// // UPDATE LOAN STATUS
// // ========================================
// async function updateStatus(id, status) {
//   try {
//     const res = await fetch(`${LOAN_API}/update-status`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         application_id: id,
//         status: status
//       })
//     });

//     if (res.ok) {
//       showToast('success', 'Status Updated', `Application #${id} ${status.toLowerCase()}`);
//       // Wait a moment before reloading to ensure database is updated
//       setTimeout(() => {
//         loadLoans();
//       }, 500);
//     } else {
//       showToast('error', 'Update Failed', 'Unable to update status');
//     }
//   } catch (error) {
//     showToast('error', 'Connection Error', 'Unable to update status');
//   }
// }

// // ========================================
// // UPDATE STATISTICS
// // ========================================
// function updateStats(total, pending, approved, rejected) {
//   const totalEl = document.getElementById('totalApps');
//   const pendingEl = document.getElementById('pendingApps');
//   const approvedEl = document.getElementById('approvedApps');
//   const rejectedEl = document.getElementById('rejectedApps');
  
//   if (totalEl) totalEl.textContent = total;
//   if (pendingEl) pendingEl.textContent = pending;
//   if (approvedEl) approvedEl.textContent = approved;
//   if (rejectedEl) rejectedEl.textContent = rejected;
// }

// // ========================================
// // LOGOUT
// // ========================================
// function logout() {
//   const username = localStorage.getItem("username") || "Officer";
//   localStorage.clear();
//   showToast('info', 'Logged Out', `Goodbye, ${username}!`);
//   setTimeout(() => {
//     window.location.href = "login.html";
//   }, 1000);
// }

// // ========================================
// // INITIALIZE
// // ========================================
// // Initial load
// loadLoans();

// // Auto refresh every 15 seconds (increased from 10 to reduce load)
// setInterval(() => {
//   if (!isLoading) {
//     loadLoans();
//   }
// }, 15000);





 const LOAN_API = "http://127.0.0.1:5000/api/loan";
const AUTH_API = "http://127.0.0.1:5000/api/auth";

let userCache = {};
let isLoading = false;
let riskChart = null;
let statusChart = null;
let allLoans = [];
let currentFilter = 'all';

// ===============================
// DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const displayUsername = localStorage.getItem("username");
  const usernameEl = document.getElementById("displayUsername");
  if (displayUsername && usernameEl) {
    usernameEl.textContent = displayUsername;
  }

  if (localStorage.getItem("officer") !== "true") {
    showToast("error", "Unauthorized", "Officer access only");
    setTimeout(() => {
      window.location.href = "officer-login.html";
    }, 2000);
    return;
  }

  loadLoans();
  setInterval(() => {
    if (!isLoading) loadLoans();
  }, 15000);
});

// ===============================
// FETCH USERNAME
// ===============================
async function fetchUsername(userId) {
  if (userCache[userId]) return userCache[userId];

  try {
    const res = await fetch(`${AUTH_API}/user/${userId}`);
    if (res.ok) {
      const data = await res.json();
      userCache[userId] = data.username;
      return data.username;
    }
  } catch (err) {
    console.error(err);
  }
  return `User #${userId}`;
}

// ===============================
// LOAD LOANS
// ===============================
async function loadLoans() {
  if (isLoading) return;
  isLoading = true;

  try {
    const res = await fetch(`${LOAN_API}/all`);
    const loans = await res.json();
    allLoans = loans;

    const table = document.getElementById("loanTable");
    if (!table) return;

    if (loans.length === 0) {
      table.innerHTML = "<p class='no-data'>📭 No loan applications yet</p>";
      updateStats(0, 0, 0, 0);
      return;
    }

    const pending = loans.filter(l => l.status === "Pending").length;
    const approved = loans.filter(l => l.status === "Approved").length;
    const rejected = loans.filter(l => l.status === "Rejected").length;
    updateStats(loans.length, pending, approved, rejected);

    drawRiskChart(loans);
    drawStatusChart(loans);

    displayLoans(loans);

  } catch (err) {
    console.error(err);
    showToast("error", "Load Error", "Unable to fetch loan applications");
  } finally {
    isLoading = false;
  }
}

// ===============================
// DISPLAY LOANS
// ===============================
async function displayLoans(loans) {
  const table = document.getElementById("loanTable");
  
  // Filter loans
  let filteredLoans = currentFilter === 'all' 
    ? loans 
    : loans.filter(l => l.status === currentFilter);

  if (filteredLoans.length === 0) {
    table.innerHTML = `<p class='no-data'>📭 No ${currentFilter === 'all' ? '' : currentFilter.toLowerCase()} applications</p>`;
    return;
  }

  let htmlContent = "";

  for (const loan of filteredLoans) {
    let username = loan.username || loan.email;
    if (!username) username = await fetchUsername(loan.user_id);

    const age = loan.age || "N/A";
    const loanAmount = loan.loan_amount || loan.credit_amount || 0;
    const loanDuration = loan.loan_duration || "N/A";
    const installmentRate = loan.installment_rate || "N/A";
    const employmentDuration = loan.employment_duration || "N/A";
    const job = loan.job !== undefined ? loan.job : "N/A";
    const mlRisk = loan.ml_risk || "Unknown";
    const status = loan.status || "Pending";
    const createdAt = loan.created_at || new Date().toISOString();

    htmlContent += `
      <div class="loan-card" data-status="${status}">
        <div class="loan-header" onclick="toggleDetails(${loan.application_id})">
          <div class="loan-main-info">
            <div class="loan-id-section">
              <span class="loan-id">#${loan.application_id}</span>
              <span class="loan-date">${new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div class="loan-user-section">
              <span class="user-avatar">👤</span>
              <div class="user-info">
                <span class="user-name">${username}</span>
                <span class="user-id">User ID: ${loan.user_id}</span>
              </div>
            </div>
          </div>

          <div class="loan-amount-section">
            <span class="amount-label">Loan Amount</span>
            <span class="amount-value">₹${parseFloat(loanAmount).toLocaleString('en-IN')}</span>
          </div>

          <div class="loan-badges">
            <span class="risk-badge ${mlRisk.toLowerCase().replace(' ', '-')}">${mlRisk}</span>
            <span class="status-badge ${status.toLowerCase()}">${status}</span>
          </div>

          <div class="expand-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <div class="loan-details" id="details-${loan.application_id}">
          <div class="details-grid">
            <div class="detail-box">
              <span class="detail-icon">🎂</span>
              <div class="detail-content">
                <span class="detail-label">Age</span>
                <span class="detail-value">${age} years</span>
              </div>
            </div>

            <div class="detail-box">
              <span class="detail-icon">📅</span>
              <div class="detail-content">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${loanDuration} months</span>
              </div>
            </div>

            <div class="detail-box">
              <span class="detail-icon">📊</span>
              <div class="detail-content">
                <span class="detail-label">Installment Rate</span>
                <span class="detail-value">${installmentRate}%</span>
              </div>
            </div>

            <div class="detail-box">
              <span class="detail-icon">💼</span>
              <div class="detail-content">
                <span class="detail-label">Employment</span>
                <span class="detail-value">${employmentDuration} years</span>
              </div>
            </div>

            <div class="detail-box">
              <span class="detail-icon">🏢</span>
              <div class="detail-content">
                <span class="detail-label">Job Type</span>
                <span class="detail-value">${getJobType(job)}</span>
              </div>
            </div>

            <div class="detail-box">
              <span class="detail-icon">🤖</span>
              <div class="detail-content">
                <span class="detail-label">AI Risk</span>
                <span class="detail-value risk-${mlRisk.toLowerCase().replace(' ', '-')}">${mlRisk}</span>
              </div>
            </div>
          </div>

          <div class="action-section">
            <button class="approve-btn" onclick="updateStatus(${loan.application_id}, 'Approved')" ${status !== "Pending" ? "disabled" : ""}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              Approve Loan
            </button>
            <button class="reject-btn" onclick="updateStatus(${loan.application_id}, 'Rejected')" ${status !== "Pending" ? "disabled" : ""}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
              Reject Loan
            </button>
          </div>
        </div>
      </div>
    `;
  }

  table.innerHTML = htmlContent;
}

// ===============================
// FILTER LOANS
// ===============================
function filterLoans(status) {
  currentFilter = status;
  
  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  displayLoans(allLoans);
}

// ===============================
// TOGGLE DETAILS
// ===============================
function toggleDetails(id) {
  const el = document.getElementById(`details-${id}`);
  const card = el.closest('.loan-card');
  
  if (el.style.maxHeight) {
    el.style.maxHeight = null;
    card.classList.remove('expanded');
  } else {
    // Close other cards
    document.querySelectorAll('.loan-details').forEach(detail => {
      detail.style.maxHeight = null;
    });
    document.querySelectorAll('.loan-card').forEach(c => {
      c.classList.remove('expanded');
    });
    
    el.style.maxHeight = el.scrollHeight + "px";
    card.classList.add('expanded');
  }
}

// ===============================
// JOB TYPE
// ===============================
function getJobType(code) {
  const map = {
    0: "Unskilled",
    1: "Skilled",
    2: "Highly Skilled",
    3: "Management"
  };
  return map[code] || "Not Specified";
}

// ===============================
// UPDATE STATUS
// ===============================
async function updateStatus(id, status) {
  try {
    const res = await fetch(`${LOAN_API}/update-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: id, status })
    });

    if (res.ok) {
      showToast("success", "Status Updated", `Application #${id} ${status.toLowerCase()}`);
      setTimeout(loadLoans, 500);
    } else {
      showToast("error", "Update Failed", "Unable to update status");
    }
  } catch {
    showToast("error", "Connection Error", "Server error");
  }
}

// ===============================
// STATS
// ===============================
function updateStats(total, pending, approved, rejected) {
  animateValue('totalApps', total);
  animateValue('pendingApps', pending);
  animateValue('approvedApps', approved);
  animateValue('rejectedApps', rejected);
}

function animateValue(id, end) {
  const el = document.getElementById(id);
  const start = parseInt(el.textContent) || 0;
  const duration = 1000;
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      el.textContent = end;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  const username = localStorage.getItem("username") || "Officer";
  localStorage.clear();
  showToast("info", "Logged Out", `Goodbye, ${username}!`);
  setTimeout(() => window.location.href = "login.html", 1000);
}

// ===============================
// CHARTS
// ===============================
function drawRiskChart(loans) {
  const high = loans.filter(l => l.ml_risk && l.ml_risk.toLowerCase().includes('high')).length;
  const low = loans.filter(l => l.ml_risk && l.ml_risk.toLowerCase().includes('low')).length;

  if (riskChart) riskChart.destroy();

  const ctx = document.getElementById("riskChart");
  riskChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["High Risk", "Low Risk"],
      datasets: [{
        data: [high, low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

function drawStatusChart(loans) {
  const approved = loans.filter(l => l.status === "Approved").length;
  const rejected = loans.filter(l => l.status === "Rejected").length;
  const pending = loans.filter(l => l.status === "Pending").length;

  if (statusChart) statusChart.destroy();

  const ctx = document.getElementById("statusChart");
  statusChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Approved", "Rejected", "Pending"],
      datasets: [{
        label: "Applications",
        data: [approved, rejected, pending],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#fff',
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}
