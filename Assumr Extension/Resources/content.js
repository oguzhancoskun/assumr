function getRandomColor() {
  const colors = ['#e74c3c', '#8e44ad', '#3498db', '#1abc9c', '#f39c12', '#d35400', '#2ecc71'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function renderPopup(profiles) {
  if (document.getElementById("assumr-modal")) return;

  const modal = document.createElement("div");
  modal.id = "assumr-modal";
  modal.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 20px;
    z-index: 9999;
    width: 300px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "X";
  closeBtn.style = "position:absolute; top:10px; right:10px; cursor:pointer;";
  closeBtn.onclick = () => modal.remove();
  modal.appendChild(closeBtn);

  const title = document.createElement("h3");
  title.innerText = "Assumr Profiles";
  modal.appendChild(title);

  profiles.forEach(p => {
    const btn = document.createElement("div");
    btn.innerText = p.profile;
    btn.style = `
      background: ${getRandomColor()};
      color: white;
      padding: 6px 12px;
      margin: 6px 0;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
    `;
    btn.onclick = () => {
      chrome.runtime.sendMessage({ action: "switchRole", profile: p });
      modal.remove();
    };
    modal.appendChild(btn);
  });

  document.body.appendChild(modal);
}

// tetikleme kısmı (shortcut veya context menu mesajıyla)
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "openPopup") {
    chrome.storage.sync.get(['profiles'], (result) => {
      renderPopup(result.profiles || []);
    });
  }
});
