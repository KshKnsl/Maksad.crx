interface Message {
  type: string;
  maksad?: string;
  enabled?: boolean;
}

let currentMaksad = '';
let focusMode = false;

// Load maksad and focus mode from storage when content script initializes
chrome.storage.local.get(['maksad', 'focusMode'], (result) => {
  console.log("Loading from storage:", result);
  if (result.maksad) {
    currentMaksad = result.maksad;
  }
  
  if (result.focusMode) {
    focusMode = result.focusMode;
    toggleFocusMode(focusMode);
  }
  
  hideDistractingElements();
});

// Function to check if text contains maksad
const containsMaksad = (text: string): boolean => {
  if (!currentMaksad) return true;
  return text.toLowerCase().includes(currentMaksad.toLowerCase());
};

// Function to show a reminder tooltip
const showMaksadReminder = () => {
  const reminder = document.createElement('div');
  reminder.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    background: #1976d2;
    color: white;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  reminder.textContent = `Remember your maksad: ${currentMaksad}`;
  document.body.appendChild(reminder);

  setTimeout(() => {
    reminder.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => reminder.remove(), 300);
  }, 3000);
};

// Function to hide distracting elements
const hideDistractingElements = () => {
  // Hide YouTube Shorts
  if (window.location.hostname.includes('youtube.com')) {
    // Hide Shorts from sidebar
    const shortsSidebar = document.querySelector('ytd-guide-section-renderer a[title="Shorts"]');
    if (shortsSidebar) {
      (shortsSidebar as HTMLElement).style.display = 'none';
    }

    // Hide statement banner
    const statementBanner = document.querySelectorAll('ytd-statement-banner-renderer');
    statementBanner.forEach((banner: Element) => {
      (banner as HTMLElement).style.display = 'none';
    });

    // Hide Shorts from main feed
    const shortsVideos = document.querySelectorAll('ytd-rich-item-renderer');
    shortsVideos.forEach((video: Element) => {
      const link = video.querySelector('a#thumbnail[href*="shorts"]');
      if (link) {
        (video as HTMLElement).style.display = 'none';
      }
    });

    // Hide promoted videos
    const promotedVideos = document.querySelectorAll('ytd-promoted-video-renderer');
    promotedVideos.forEach((video: Element) => {
      (video as HTMLElement).style.display = 'none';
    });

    // Hide reels shelf
    const reelsShelf = document.querySelectorAll('ytd-reel-shelf-renderer');
    reelsShelf.forEach((shelf: Element) => {
      (shelf as HTMLElement).style.display = 'none';
    });

    // Hide empty sections and dividers
    const emptyElements = document.querySelectorAll(`
      ytd-horizontal-card-list-renderer:empty,
      ytd-item-section-renderer:empty,
      ytd-shelf-renderer:empty,
      .ytd-rich-section-renderer:empty,
      ytd-video-renderer:empty,
      ytd-rich-grid-row:empty,
      ytd-rich-shelf-renderer:empty
    `);
    emptyElements.forEach((element: Element) => {
      (element as HTMLElement).style.display = 'none';
    });

    // Filter regular videos based on maksad
    const videoTitles = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
    videoTitles.forEach((video: Element) => {
      const titleElement = video.querySelector('#video-title, .title');
      if (titleElement) {
        const title = titleElement.textContent || '';
        if (!containsMaksad(title)) {
          (video as HTMLElement).style.display = 'none';
          // Also hide the parent shelf if all its videos are hidden
          const parentShelf = video.closest('ytd-shelf-renderer, ytd-rich-shelf-renderer');
          if (parentShelf) {
            const visibleVideos = parentShelf.querySelectorAll('ytd-video-renderer[style*="display: block"], ytd-rich-item-renderer[style*="display: block"]');
            if (visibleVideos.length === 0) {
              (parentShelf as HTMLElement).style.display = 'none';
            }
          }
        }
      }
    });

    // Add focus mode button
    if (!document.querySelector('#focus-mode-btn')) {
      const focusBtn = document.createElement('button');
      focusBtn.id = 'focus-mode-btn';
      focusBtn.innerHTML = '🎯 Focus Mode';
      focusBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      focusBtn.onclick = () => {
        document.body.classList.toggle('focus-mode');
        showMaksadReminder();
      };
      document.body.appendChild(focusBtn);
    }
  }

  // Hide social media feed items that don't contain maksad
  const feedItems = document.querySelectorAll('article, [role="article"], .post, .tweet');
  feedItems.forEach((item: Element) => {
    const text = item.textContent || '';
    if (!containsMaksad(text)) {
      (item as HTMLElement).style.display = 'none';
    }
  });
};

// Function to remove distracting elements filter
const removeDistractingElementsFilter = () => {
  // Show YouTube Shorts
  if (window.location.hostname.includes('youtube.com')) {
    // Show Shorts from sidebar
    const shortsSidebar = document.querySelector('ytd-guide-section-renderer a[title="Shorts"]');
    if (shortsSidebar) {
      (shortsSidebar as HTMLElement).style.display = '';
    }

    // Show statement banner
    const statementBanner = document.querySelectorAll('ytd-statement-banner-renderer');
    statementBanner.forEach((banner: Element) => {
      (banner as HTMLElement).style.display = '';
    });

    // Show Shorts from main feed
    const shortsVideos = document.querySelectorAll('ytd-rich-item-renderer');
    shortsVideos.forEach((video: Element) => {
      const link = video.querySelector('a#thumbnail[href*="shorts"]');
      if (link) {
        (video as HTMLElement).style.display = '';
      }
    });

    // Show promoted videos
    const promotedVideos = document.querySelectorAll('ytd-promoted-video-renderer');
    promotedVideos.forEach((video: Element) => {
      (video as HTMLElement).style.display = '';
    });

    // Show reels shelf
    const reelsShelf = document.querySelectorAll('ytd-reel-shelf-renderer');
    reelsShelf.forEach((shelf: Element) => {
      (shelf as HTMLElement).style.display = '';
    });

    // Show empty sections and dividers
    const emptyElements = document.querySelectorAll(`
      ytd-horizontal-card-list-renderer:empty,
      ytd-item-section-renderer:empty,
      ytd-shelf-renderer:empty,
      .ytd-rich-section-renderer:empty,
      ytd-video-renderer:empty,
      ytd-rich-grid-row:empty,
      ytd-rich-shelf-renderer:empty
    `);
    emptyElements.forEach((element: Element) => {
      (element as HTMLElement).style.display = '';
    });

    // Show regular videos
    const videoTitles = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');
    videoTitles.forEach((video: Element) => {
      (video as HTMLElement).style.display = '';
    });
  }

  // Show social media feed items
  const feedItems = document.querySelectorAll('article, [role="article"], .post, .tweet');
  feedItems.forEach((item: Element) => {
    (item as HTMLElement).style.display = '';
  });
};

// Function to toggle focus mode
function toggleFocusMode(enabled: boolean) {
  console.log("Content script: toggling focus mode to", enabled);
  focusMode = enabled;
  document.body.classList.toggle('focus-mode', enabled);
  
  if (enabled && currentMaksad) {
    showMaksadReminder();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.type === 'UPDATE_MAKSAD' && message.maksad) {
    currentMaksad = message.maksad;
    // Store maksad in chrome storage
    chrome.storage.local.set({ maksad: message.maksad }, () => {
      hideDistractingElements();
      showMaksadReminder();
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  } 
  else if (message.type === 'REMOVE_MAKSAD') {
    currentMaksad = '';
    // Remove maksad from chrome storage
    chrome.storage.local.remove('maksad', () => {
      removeDistractingElementsFilter();
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  } 
  else if (message.type === 'TOGGLE_FOCUS_MODE') {
    try {
      toggleFocusMode(!!message.enabled);
      sendResponse({ success: true });
    } catch (error) {
      console.error("Error toggling focus mode:", error);
      sendResponse({ success: false, error: String(error) });
    }
    return true; // Keep message channel open for async response
  }
  
  // Default response if message type is not recognized
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});

// Run initial cleanup
hideDistractingElements();

// Create observer to handle dynamically loaded content
const observer = new MutationObserver(() => {
  if (currentMaksad) {
    hideDistractingElements();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});