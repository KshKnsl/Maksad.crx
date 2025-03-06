function requestMicrophoneAccess() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("permissions.html"),
    active: true,
  });
}
chrome.runtime.onInstalled.addListener(requestMicrophoneAccess);
