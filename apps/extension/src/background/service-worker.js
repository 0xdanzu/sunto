// Sunto Background Service Worker
// Handles auth state and API communication

const API_URL = 'https://sunto.app/api';
const WEBHOOK_URL = `${API_URL}/webhook`;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'GET_AUTH_STATUS':
      return getAuthStatus();

    case 'CAPTURE_TWEET':
      return captureTweet(message.payload);

    case 'LOGIN':
      return initiateLogin();

    case 'LOGOUT':
      return logout();

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

async function getAuthStatus() {
  try {
    const stored = await chrome.storage.local.get(['userId', 'authToken']);

    if (stored.userId && stored.authToken) {
      // Verify token is still valid
      const isValid = await verifyToken(stored.authToken);
      if (isValid) {
        return {
          success: true,
          userId: stored.userId,
          isAuthenticated: true,
        };
      }
    }

    return {
      success: true,
      userId: null,
      isAuthenticated: false,
    };
  } catch (error) {
    console.error('Auth status error:', error);
    return {
      success: false,
      error: error.message,
      isAuthenticated: false,
    };
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function captureTweet(payload) {
  try {
    const stored = await chrome.storage.local.get(['webhookSecret']);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stored.webhookSecret || ''}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to capture tweet');
    }

    return {
      success: true,
      tweetId: data.tweetId,
    };
  } catch (error) {
    console.error('Capture error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function initiateLogin() {
  // Open Sunto login page
  const loginUrl = 'https://sunto.app/login?extension=true';

  chrome.tabs.create({ url: loginUrl });

  return { success: true };
}

async function logout() {
  await chrome.storage.local.remove(['userId', 'authToken', 'webhookSecret']);
  return { success: true };
}

// Listen for auth callback from web app
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    if (sender.origin !== 'https://sunto.app') {
      sendResponse({ success: false, error: 'Invalid origin' });
      return;
    }

    if (message.type === 'AUTH_SUCCESS') {
      const { userId, authToken, webhookSecret } = message.payload;

      await chrome.storage.local.set({
        userId,
        authToken,
        webhookSecret,
      });

      sendResponse({ success: true });
    }

    return true;
  }
);

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({ url: 'https://sunto.app/welcome?extension=true' });
  }
});
