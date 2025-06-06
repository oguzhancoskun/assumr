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
    console.log("AssumR context menu clicked");

    browser.tabs.sendMessage(tab.id, { action: "showAlert" });
  }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);

  if (request.greeting === "hello") {
    return Promise.resolve({ farewell: "goodbye" });
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command === "open-assumr-menu") {
    // Aktif sekmeyi al ve mesaj yolla
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) return;
      const tab = tabs[0];

      browser.tabs.sendMessage(tab.id, { action: "showAlert" });
    });
  }
});
