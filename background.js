// Keep track of content script status
let contentScriptStatus = {};

// Listen for content script loading
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "contentScriptLoaded") {
    contentScriptStatus[sender.tab.id] = true;
    sendResponse({ status: "acknowledged" });
  }
});

// Function to inject content script if needed
function ensureContentScript(tabId, callback) {
  if (contentScriptStatus[tabId]) {
    callback(true);
    return;
  }

  chrome.tabs.executeScript(tabId, { file: "content.js" }, (result) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to inject content script:",
        chrome.runtime.lastError
      );
      callback(false);
    } else {
      callback(true);
    }
  });
}
