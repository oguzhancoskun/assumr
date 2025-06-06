// background.js
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "assumr-switch",
    title: "🔁 Switch AWS Role (AssumR)",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.aws.amazon.com/*"]
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "assumr-switch") {
    setTimeout(() => {
      browser.tabs.sendMessage(tab.id, { action: "openPopup" });
    }, 100);
  }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "hello") {
    return Promise.resolve({ farewell: "goodbye" });
  }

  if (request.action === "switchRole") {
    const { profile, roleArn, sourceProfile, region } = request.profile;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, {
        action: "performSwitch",
        profile: request.profile
      });
    });
  }

  if (request.action === "fetchProfilesFromProxy") {
    const { proxyPort, proxyToken } = request;
    const proxyUrl = `http://localhost:${proxyPort}/profiles`;

    fetch(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${proxyToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(`Proxy fetch failed: ${response.status} ${response.statusText} - ${text}`); });
      }
      return response.json();
    })
    .then(profiles => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: "profilesFetched", profiles: profiles });
      }
    })
    .catch(error => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: "profilesFetched", profiles: [] });
      }
    });
    return true;
  }

  if (request.action === "testProxyConnection") {
    const { proxyPort, proxyToken } = request;
    const proxyUrl = `http://localhost:${proxyPort}/`;

    fetch(proxyUrl, {
      headers: {
        'Authorization': `Bearer ${proxyToken}`
      },
      signal: AbortSignal.timeout(5000)
    })
    .then(response => {
      if (response.ok) {
        if (sender.tab && sender.tab.id) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "proxyTestResult", success: true });
        }
      } else {
        if (sender.tab && sender.tab.id) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "proxyTestResult", success: false });
        }
      }
    })
    .catch(error => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: "proxyTestResult", success: false, error: error.message });
      }
    });
    return true;
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command === "open-assumr-menu") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) return;
      const tab = tabs[0];
      setTimeout(() => {
        browser.tabs.sendMessage(tab.id, { action: "openPopup" });
      }, 100);
    });
  }
});

