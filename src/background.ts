import messages from "./entities/messages";

let isListening = false;
const useTabs = {} as Record<number, { isOpen: boolean; isMax: boolean }>;

function toggleView(id: number): void {
  useTabs[id].isOpen = !useTabs[id].isOpen;
  chrome.tabs.sendMessage(id, {
    type: messages.TOGGLE_PANEL
  });
}

function runScriptOrToggle(tabId: number, isMax = true): void {
  if (!useTabs[tabId]) {
    chrome.tabs.insertCSS(tabId, { file: "content.css" });
    chrome.tabs.executeScript(tabId, { file: "chunk-vendors.js" });
    chrome.tabs.executeScript(tabId, { file: "content.js" }, () => {
      useTabs[tabId] = { isOpen: true, isMax };
      if (isMax) {
        chrome.tabs.sendMessage(tabId, {
          type: messages.SET_MAXIMIZE
        });
      }
    });
  } else {
    toggleView(tabId);
  }
}

function pingScript(tabId, failedCallback, waitMs = 500): void {
  const timeout = setTimeout(failedCallback, waitMs);
  const callback = (): void => {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: messages.PING
      },
      res => res === true && clearTimeout(timeout)
    );
  };
  // this requires for avoiding exception that stops chrome-extension
  chrome.tabs.executeScript(
    tabId,
    {
      code: `const fn = (msg, _s, res) => {
              msg.type === '${messages.PING}' && res(false);
              setTimeout(()=>chrome.runtime.onMessage.removeListener(fn), ${waitMs * 2})
            };
            chrome.runtime.onMessage.addListener(fn);`
    },
    callback
  );
}

function listen(): void {
  if (isListening) {
    return;
  }
  isListening = true;

  chrome.tabs.onUpdated.addListener((id, info) => {
    const r = useTabs[id];
    if (r && info.status === "complete") {
      pingScript(id, () => {
        delete useTabs[id];
        runScriptOrToggle(id, r.isMax);
      });
    }
  });

  chrome.tabs.onRemoved.addListener(id => {
    delete useTabs[id];
  });

  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === messages.MAXIMIZE) {
      const tab = useTabs[sender.tab.id];
      tab.isMax = msg.isMax;
    }
  });
}

chrome.browserAction.onClicked.addListener(tab => {
  if (tab.id) {
    listen();
    runScriptOrToggle(tab.id);
  }
});
