const confirmed = new Set();

// The React page tells us it rendered
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === 'NEWTAB_LOADED' && sender.tab?.id != null) {
    confirmed.add(sender.tab.id);
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install' && details.reason !== 'update') return;

  const tab = await chrome.tabs.create({});

  setTimeout(() => {
    if (!confirmed.has(tab.id)) {
      chrome.tabs
        .update(tab.id, { url: chrome.runtime.getURL('index.html?conflict=1') })
        .catch(() => {});
    }
    confirmed.delete(tab.id);
  }, 2000);
});
