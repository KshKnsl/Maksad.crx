let currentMaksad = '';

// Function to check if text contains maksad
const containsMaksad = (text: string): boolean => {
  if (!currentMaksad) return true;
  return text.toLowerCase().includes(currentMaksad.toLowerCase());
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_MAKSAD') {
    currentMaksad = message.maksad;
    hideDistractingElements();
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