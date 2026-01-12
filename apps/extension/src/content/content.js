// Sunto Content Script - Injects capture button on tweets
// Based on patterns from Hammerhead repo

const SELECTORS = {
  tweet: '[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  time: 'time[datetime]',
  video: '[data-testid="videoPlayer"]',
  article: '[data-testid="card.wrapper"]',
  showMore: '[data-testid="tweet-text-show-more-link"]',
  tweetActions: '[role="group"]',
  avatar: '[data-testid="Tweet-User-Avatar"] img',
};

const API_URL = 'https://sunto.app/api';
const BUTTON_CLASS = 'sunto-capture-btn';

// Track which tweets have buttons
const processedTweets = new WeakSet();

// Initialize
function init() {
  // Process existing tweets
  processExistingTweets();

  // Watch for new tweets
  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function handleMutations(mutations) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processNode(node);
        }
      }
    }
  }
}

function processNode(node) {
  // Check if node is a tweet
  if (node.matches?.(SELECTORS.tweet)) {
    addCaptureButton(node);
  }

  // Check for tweets inside node
  const tweets = node.querySelectorAll?.(SELECTORS.tweet) || [];
  tweets.forEach(addCaptureButton);
}

function processExistingTweets() {
  const tweets = document.querySelectorAll(SELECTORS.tweet);
  tweets.forEach(addCaptureButton);
}

function addCaptureButton(tweetElement) {
  if (processedTweets.has(tweetElement)) return;
  processedTweets.add(tweetElement);

  // Create button container
  const container = document.createElement('div');
  container.className = 'sunto-btn-container';

  // Create button
  const button = document.createElement('button');
  button.className = BUTTON_CLASS;
  button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  button.title = 'Save to Sunto';

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    captureTweet(tweetElement, button);
  });

  container.appendChild(button);

  // Add button to tweet
  // Position it in the top-right corner
  tweetElement.style.position = 'relative';
  container.style.position = 'absolute';
  container.style.top = '8px';
  container.style.right = '8px';
  container.style.zIndex = '10';
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.2s';

  tweetElement.appendChild(container);

  // Show on hover
  tweetElement.addEventListener('mouseenter', () => {
    container.style.opacity = '1';
  });

  tweetElement.addEventListener('mouseleave', () => {
    container.style.opacity = '0';
  });
}

async function captureTweet(tweetElement, button) {
  // Show loading state
  button.classList.add('loading');
  button.disabled = true;

  try {
    // Extract tweet data
    const tweetData = await extractTweetData(tweetElement);

    if (!tweetData) {
      throw new Error('Could not extract tweet data');
    }

    // Get auth status from background
    const authData = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });

    if (!authData.success || !authData.userId) {
      // Open popup for login
      showToast('Please log in to Sunto first', 'error');
      button.classList.remove('loading');
      button.disabled = false;
      return;
    }

    // Send to background for processing
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_TWEET',
      payload: {
        ...tweetData,
        userId: authData.userId,
      },
    });

    if (response.success) {
      button.classList.remove('loading');
      button.classList.add('success');
      showToast('Saved to Sunto!', 'success');

      // Reset after animation
      setTimeout(() => {
        button.classList.remove('success');
        button.disabled = false;
      }, 2000);
    } else {
      throw new Error(response.error || 'Failed to capture');
    }
  } catch (error) {
    console.error('Capture error:', error);
    button.classList.remove('loading');
    button.classList.add('error');
    showToast(error.message || 'Failed to save', 'error');

    setTimeout(() => {
      button.classList.remove('error');
      button.disabled = false;
    }, 2000);
  }
}

async function extractTweetData(tweetElement) {
  // Get tweet URL from time element's parent link
  const timeElement = tweetElement.querySelector(SELECTORS.time);
  const tweetLink = timeElement?.closest('a');
  const tweetUrl = tweetLink?.href;

  if (!tweetUrl) {
    // Try to get from current URL if on tweet page
    const match = window.location.href.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/);
    if (!match) return null;
  }

  // Parse tweet ID and username from URL
  const urlMatch = (tweetUrl || window.location.href).match(
    /(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/
  );
  if (!urlMatch) return null;

  const [, authorHandle, tweetId] = urlMatch;

  // Get author info
  const userNameElement = tweetElement.querySelector(SELECTORS.userName);
  const authorName = userNameElement?.querySelector('span')?.textContent || authorHandle;

  // Get avatar
  const avatarElement = tweetElement.querySelector(SELECTORS.avatar);
  const authorAvatar = avatarElement?.src;

  // Expand "Show more" if present
  const showMoreBtn = tweetElement.querySelector(SELECTORS.showMore);
  if (showMoreBtn) {
    showMoreBtn.click();
    await wait(500);
  }

  // Get tweet text
  const tweetTextElement = tweetElement.querySelector(SELECTORS.tweetText);
  const rawText = tweetTextElement?.textContent || '';

  // Determine content type
  let contentType = 'single';
  let hasVideo = false;
  let articleUrl = null;

  if (tweetElement.querySelector(SELECTORS.video)) {
    contentType = 'video';
    hasVideo = true;
  }

  const articleCard = tweetElement.querySelector(SELECTORS.article);
  if (articleCard) {
    contentType = 'article';
    const articleLink = articleCard.querySelector('a[href]');
    articleUrl = articleLink?.href;
  }

  // Check if this is a thread by looking at the URL or context
  // For now, we'll mark single tweets; thread detection would need scrolling

  return {
    tweetId,
    tweetUrl: tweetUrl || window.location.href,
    authorHandle,
    authorName,
    authorAvatar,
    rawText,
    fullContent: rawText, // For single tweets, same as raw
    contentType,
    hasVideo,
    articleUrl,
  };
}

function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.sunto-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `sunto-toast sunto-toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
