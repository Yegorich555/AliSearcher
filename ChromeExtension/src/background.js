const messages = {
  TOGGLE_PANEL: 1
};

function handleExtensionClick(tab) {
  chrome.tabs.insertCSS(tab.id, { file: "content.css" });
  chrome.tabs.executeScript(tab.id, { file: "chunk-vendors.js" });
  chrome.tabs.executeScript(
    tab.id,
    { file: "content.js" },
    function tabCallback() {
      chrome.tabs.sendMessage(tab.id, {
        type: messages.TOGGLE_PANEL
      });
    }
  );
}

chrome.browserAction.onClicked.addListener(handleExtensionClick);
