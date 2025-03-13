interface Message {
  type: string;
  maksad?: string;
}

let currentMaksad = '';

// Load maksad from storage when content script initializes
chrome.storage.local.get(['maksad'], (result) => {
  if (result.maksad) {
    currentMaksad = result.maksad;
    hideDistractingElements();
  }
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

    // Filter regular videos based on maksad
    const videoTitles = document.querySelectorAll('ytd-video-renderer');
    videoTitles.forEach((video: Element) => {
      const titleElement = video.querySelector('#video-title');
      if (titleElement) {
        const title = titleElement.textContent || '';
        if (!containsMaksad(title)) {
          (video as HTMLElement).style.display = 'none';
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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'UPDATE_MAKSAD' && message.maksad) {
    currentMaksad = message.maksad;
    // Store maksad in chrome storage
    chrome.storage.local.set({ maksad: message.maksad }, () => {
      hideDistractingElements();
      showMaksadReminder();
    });
  }
});

// Run initial cleanup
hideDistractingElements();

// Create observer to handle dynamically loaded content
const observer = new MutationObserver(() => {
  hideDistractingElements();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
}); 