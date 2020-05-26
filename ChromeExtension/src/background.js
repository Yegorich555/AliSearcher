import messages from "./entities/messages";

function handleExtensionClick(tab) {
  chrome.tabs.insertCSS(tab.id, { file: "content.css" });
  chrome.tabs.executeScript(tab.id, { file: "chunk-vendors.js" });
  chrome.tabs.executeScript(tab.id, { file: "content.js" }, function tabCallback() {
    chrome.tabs.sendMessage(tab.id, {
      type: messages.TOGGLE_PANEL
    });
  });
}

// function t(t) {
//   chrome.browserAction.setPopup({ tabId: e.id, popup: t });
// }
// function r(t) {
//   chrome.browserAction.setIcon({
//     path: chrome.extension.getURL(t),
//     tabId: e.id
//   });
// }

chrome.browserAction.onClicked.addListener(handleExtensionClick);
