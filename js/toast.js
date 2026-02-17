// Toast Notification System - 5 SECOND DURATION
const showToast = (type, title, message, duration = 5000) => {  // ← CHANGED from 3000 to 5000
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">×</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  // Pause on hover
  toast.addEventListener('mouseenter', () => {
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'paused';
  });

  toast.addEventListener('mouseleave', () => {
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'running';
  });

  const autoRemove = setTimeout(() => removeToast(toast), duration);
  toast.dataset.timeoutId = autoRemove;
};

const removeToast = (toast) => {
  if (toast.dataset.timeoutId) {
    clearTimeout(parseInt(toast.dataset.timeoutId));
  }

  toast.classList.add('hide');
  
  setTimeout(() => {
    toast.remove();
    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 400);
};

window.showToast = showToast;
