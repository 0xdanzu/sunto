// Sunto Popup Script

const elements = {
  loading: document.getElementById('loading'),
  loggedOut: document.getElementById('logged-out'),
  loggedIn: document.getElementById('logged-in'),
  loginBtn: document.getElementById('login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  unreadCount: document.getElementById('unread-count'),
  totalCount: document.getElementById('total-count'),
};

// Initialize
async function init() {
  try {
    const authStatus = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });

    elements.loading.style.display = 'none';

    if (authStatus.success && authStatus.isAuthenticated) {
      showLoggedIn();
      await fetchStats();
    } else {
      showLoggedOut();
    }
  } catch (error) {
    console.error('Init error:', error);
    showLoggedOut();
  }
}

function showLoggedIn() {
  elements.loggedOut.style.display = 'none';
  elements.loggedIn.style.display = 'block';
}

function showLoggedOut() {
  elements.loggedIn.style.display = 'none';
  elements.loggedOut.style.display = 'block';
}

async function fetchStats() {
  try {
    const response = await fetch('https://sunto.app/api/digest?limit=1');
    const data = await response.json();

    if (data.success) {
      elements.unreadCount.textContent = data.unreadCount || 0;
      elements.totalCount.textContent = data.totalCount || 0;
    }
  } catch (error) {
    console.error('Fetch stats error:', error);
    elements.unreadCount.textContent = '-';
    elements.totalCount.textContent = '-';
  }
}

// Event listeners
elements.loginBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'LOGIN' });
  window.close();
});

elements.logoutBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'LOGOUT' });
  showLoggedOut();
});

// Start
init();
