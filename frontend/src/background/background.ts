interface MessageResponse {
  success: boolean;
  error?: string;
}

interface ExtensionMessage {
  type: 'UPDATE_MAKSAD' | 'REMOVE_MAKSAD' | 'TOGGLE_FOCUS_MODE';
  maksad?: string;
  enabled?: boolean;
}

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

// Helper function to check if URL is injectable
const isInjectableUrl = (url: string | undefined): boolean => {
  return url ? (url.startsWith('http://') || url.startsWith('https://')) : false;
};

// Ensure content script is injected when needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && isInjectableUrl(tab.url)) {
    try {
      // Check if we can access the tab
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!currentTab?.id || !isInjectableUrl(currentTab.url)) return;

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['contentScript.js']
      });

      // Inject styles
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['styles.css']
      });
      
      // Apply focus mode if it's enabled
      chrome.storage.local.get(['focusMode'], (result) => {
        if (result.focusMode) {
          chrome.tabs.sendMessage(tabId, { 
            type: 'TOGGLE_FOCUS_MODE', 
            enabled: true 
          });
        }
      });
    } catch (error) {
      console.error('Injection error:', error);
    }
  }
});

// Handle messages from popup to content script
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender, // Renamed to _sender to indicate it's not used
  sendResponse: (response: MessageResponse) => void
) => {
  console.log("Background received message:", message);
  
  if (message.type === 'UPDATE_MAKSAD' || message.type === 'REMOVE_MAKSAD' || message.type === 'TOGGLE_FOCUS_MODE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && activeTab.url && isInjectableUrl(activeTab.url)) {
        try {
          chrome.tabs.sendMessage(activeTab.id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to tab:', chrome.runtime.lastError);
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse(response || { success: true });
            }
          });
        } catch (error) {
          const err = error as Error;
          console.error('Failed to send message to content script:', err);
          sendResponse({ success: false, error: err.message });
        }
      } else {
        sendResponse({ success: false, error: 'Invalid tab or URL' });
      }
    });
    return true; // Keep the message channel open for async response
  }
  return false;
});