let currentMaksadList: string[] = [];
let focusMode = false;
let blocklist: string[] = [];
let allowThisSession = false;
chrome.storage.local.get(['maksadList', 'focusMode', 'blocklist'], r => {
  if (Array.isArray(r.maksadList)) currentMaksadList = r.maksadList;
  if (r.focusMode) { focusMode = r.focusMode; toggleFocusMode(focusMode); }
  if (Array.isArray(r.blocklist)) blocklist = r.blocklist;
  checkAndBlockSite();
  hideDistractingElements();
});
function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return window.location.hostname.replace(/^www\./, ''); }
}
function showBlockOverlay(domain: string) {
  if (document.getElementById('maksad-block-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'maksad-block-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;color:#fff;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.5rem;font-family:Arial,sans-serif;';
  overlay.innerHTML = `<div style="margin-bottom:2rem;">This site (<b>${domain}</b>) is blocked by Maksad Nahi Bhulna Dunga</div><button id="allow-this-time-btn" style="padding:0.75rem 2rem;font-size:1.1rem;background:#222;color:#fff;border:2px solid #fff;border-radius:8px;cursor:pointer;">Allow this time</button>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  document.getElementById('allow-this-time-btn')?.addEventListener('click', () => { allowThisSession = true; overlay.remove(); document.body.style.overflow = ''; });
}
function checkAndBlockSite() {
  if (allowThisSession) return;
  const domain = getDomain(window.location.href);
  if (blocklist.some(b => domain === b || domain.endsWith('.' + b))) showBlockOverlay(domain);
}
const containsMaksad = (text: string) => !currentMaksadList.length ? true : currentMaksadList.some(k => (text || '').toLowerCase().includes(k.toLowerCase()));
const showMaksadReminder = () => {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px;background:#1976d2;color:white;border-radius:8px;z-index:9999;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:Arial,sans-serif;max-width:300px;animation:slideIn 0.3s ease-out;';
  d.textContent = currentMaksadList.length ? `Remember your maksad: ${currentMaksadList.join(', ')}` : 'Add some keywords to focus on your maksad';
  document.body.appendChild(d);
  setTimeout(() => { d.style.animation = 'fadeOut 0.3s ease-out'; setTimeout(() => d.remove(), 300); }, 3000);
};
const hideDistractingElements = () => {
  if (window.location.hostname.includes('youtube.com')) {
    const shortsSidebar = document.querySelector('ytd-guide-section-renderer a[title="Shorts"]') as HTMLElement | null;
    if (shortsSidebar) shortsSidebar.style.display = 'none';
    document.querySelectorAll('ytd-statement-banner-renderer').forEach(e => (e as HTMLElement).style.display = 'none');
    document.querySelectorAll('ytd-rich-item-renderer').forEach(v => { const l = v.querySelector('a#thumbnail[href*="shorts"]'); if (l) (v as HTMLElement).style.display = 'none'; });
    document.querySelectorAll('ytd-promoted-video-renderer').forEach(v => (v as HTMLElement).style.display = 'none');
    document.querySelectorAll('ytd-reel-shelf-renderer').forEach(s => (s as HTMLElement).style.display = 'none');
    document.querySelectorAll('ytd-horizontal-card-list-renderer:empty,ytd-item-section-renderer:empty,ytd-shelf-renderer:empty,.ytd-rich-section-renderer:empty,ytd-video-renderer:empty,ytd-rich-grid-row:empty,ytd-rich-shelf-renderer:empty').forEach(e => (e as HTMLElement).style.display = 'none');
    document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer').forEach(v => { const t = v.querySelector('#video-title, .title'); if (t && !containsMaksad((t.textContent || ''))) { (v as HTMLElement).style.display = 'none'; const p = v.closest('ytd-shelf-renderer, ytd-rich-shelf-renderer'); if (p) { const vis = p.querySelectorAll('ytd-video-renderer[style*="display: block"], ytd-rich-item-renderer[style*="display: block"]'); if (!vis.length) (p as HTMLElement).style.display = 'none'; } } });
    if (!document.querySelector('#focus-mode-btn')) {
      const btn = document.createElement('button');
      btn.id = 'focus-mode-btn';
      btn.innerHTML = '🎯 Focus Mode';
      btn.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:10px 20px;background:#1976d2;color:white;border:none;border-radius:20px;cursor:pointer;z-index:9999;font-weight:bold;box-shadow:0 2px 5px rgba(0,0,0,0.2);';
      btn.onclick = () => { document.body.classList.toggle('focus-mode'); showMaksadReminder(); };
      document.body.appendChild(btn);
    }
  }
  document.querySelectorAll('article, [role="article"], .post, .tweet').forEach(i => { if (!containsMaksad((i.textContent || ''))) (i as HTMLElement).style.display = 'none'; });
};
const removeDistractingElementsFilter = () => {
  if (window.location.hostname.includes('youtube.com')) {
    const shortsSidebar = document.querySelector('ytd-guide-section-renderer a[title="Shorts"]') as HTMLElement | null;
    if (shortsSidebar) shortsSidebar.style.display = '';
    document.querySelectorAll('ytd-statement-banner-renderer').forEach(e => (e as HTMLElement).style.display = '');
    document.querySelectorAll('ytd-rich-item-renderer').forEach(v => { const l = v.querySelector('a#thumbnail[href*="shorts"]'); if (l) (v as HTMLElement).style.display = ''; });
    document.querySelectorAll('ytd-promoted-video-renderer').forEach(v => (v as HTMLElement).style.display = '');
    document.querySelectorAll('ytd-reel-shelf-renderer').forEach(s => (s as HTMLElement).style.display = '');
    document.querySelectorAll('ytd-horizontal-card-list-renderer:empty,ytd-item-section-renderer:empty,ytd-shelf-renderer:empty,.ytd-rich-section-renderer:empty,ytd-video-renderer:empty,ytd-rich-grid-row:empty,ytd-rich-shelf-renderer:empty').forEach(e => (e as HTMLElement).style.display = '');
    document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer').forEach(v => (v as HTMLElement).style.display = '');
  }
  document.querySelectorAll('article, [role="article"], .post, .tweet').forEach(i => (i as HTMLElement).style.display = '');
};
function toggleFocusMode(enabled: boolean | undefined) {
  focusMode = enabled ?? false;
  document.body.classList.toggle('focus-mode', focusMode);
  if (focusMode && currentMaksadList.length) showMaksadReminder();
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_MAKSAD' && message.maksadList) {
    currentMaksadList = message.maksadList;
    chrome.storage.local.set({ maksadList: message.maksadList }, () => { hideDistractingElements(); showMaksadReminder(); sendResponse({ success: true }); });
    return true;
  } else if (message.type === 'REMOVE_MAKSAD') {
    currentMaksadList = [];
    chrome.storage.local.remove('maksadList', () => { removeDistractingElementsFilter(); sendResponse({ success: true }); });
    return true;
  } else if (message.type === 'TOGGLE_FOCUS_MODE') {
    try { toggleFocusMode(!!message.enabled); sendResponse({ success: true }); } catch (error) { sendResponse({ success: false, error: String(error) }); }
    return true;
  }
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blocklist) { blocklist = changes.blocklist.newValue || []; allowThisSession = false; checkAndBlockSite(); }
});
checkAndBlockSite();
hideDistractingElements();
const observer = new MutationObserver(() => { if (currentMaksadList.length) hideDistractingElements(); checkAndBlockSite(); });
observer.observe(document.body, { childList: true, subtree: true });