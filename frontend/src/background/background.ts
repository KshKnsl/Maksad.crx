const isInjectableUrl = (url: string | undefined) => url ? (url.startsWith('http://') || url.startsWith('https://')) : false;
chrome.runtime.onInstalled.addListener(() => {});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && isInjectableUrl(tab.url)) {
    try {
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!currentTab?.id || !isInjectableUrl(currentTab.url)) return;
      await chrome.scripting.executeScript({ target: { tabId }, files: ['contentScript.js'] });
      await chrome.scripting.insertCSS({ target: { tabId }, files: ['styles.css'] });
      chrome.storage.local.get(['focusMode', 'maksadList', 'blocklist'], (result) => {
        if (result.focusMode) chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_FOCUS_MODE', enabled: true });
        if (result.maksadList && Array.isArray(result.maksadList) && result.maksadList.length > 0) chrome.tabs.sendMessage(tabId, { type: 'UPDATE_MAKSAD', maksadList: result.maksadList });
      });
    } catch (error) {}
  }
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_MAKSAD' || message.type === 'REMOVE_MAKSAD' || message.type === 'TOGGLE_FOCUS_MODE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && activeTab.url && isInjectableUrl(activeTab.url)) {
        try {
          chrome.tabs.sendMessage(activeTab.id, message, (response) => {
            if (chrome.runtime.lastError) sendResponse({ success: false, error: chrome.runtime.lastError.message });
            else sendResponse(response || { success: true });
          });
  } catch (error) { sendResponse({ success: false, error: (error instanceof Error ? error.message : String(error)) }); }
      } else sendResponse({ success: false, error: 'Invalid tab or URL' });
    });
    return true;
  }
  return false;
});