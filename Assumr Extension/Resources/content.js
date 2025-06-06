console.log("Assumr content script started.");

function getRandomColor() {
  const colors = ['#e74c3c', '#8e44ad', '#3498db', '1abc9c', 'f39c12', 'd35400', '2ecc71'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function openAssumrModal(profiles) {
  if (document.getElementById("assumr-modal")) return;

  let allProfiles = profiles;

  const modal = document.createElement("div");
  modal.id = "assumr-modal";
  modal.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 25px;
    z-index: 9999;
    width: 320px;
    max-width: 90%;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style = `
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 18px;
    border: none;
    background: none;
    cursor: pointer;
    color: #888;
  `;
  closeBtn.onclick = () => modal.remove();
  modal.appendChild(closeBtn);

  const title = document.createElement("h3");
  title.innerText = "Assumr Profiles";
  title.style = `
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 20px;
    color: #333;
    text-align: center;
  `;
  modal.appendChild(title);

  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search profiles...");
  searchInput.style = `
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 15px;
  `;
  modal.appendChild(searchInput);

  const profilesContainer = document.createElement("div");
  profilesContainer.style = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 5px;
  `;
  modal.appendChild(profilesContainer);

  const renderProfileButtons = (profilesToRender) => {
    profilesContainer.innerHTML = '';
    profilesToRender.forEach(p => {
      const btn = document.createElement("button");
      btn.innerText = p.profile;
      btn.style = `
        background: ${p.color || getRandomColor()};
        color: white;
        padding: 12px 15px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        font-size: 15px;
        font-weight: 500;
        transition: opacity 0.2s ease;
        word-break: break-all;
      `;
      btn.onmouseover = () => btn.style.opacity = 0.9;
      btn.onmouseout = () => btn.style.opacity = 1;

      btn.onclick = () => {
        chrome.runtime.sendMessage({ action: "switchRole", profile: p });
        modal.remove();
      };
      profilesContainer.appendChild(btn);
    });
  };

  searchInput.addEventListener('input', (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const filteredProfiles = allProfiles.filter(p =>
      p.profile.toLowerCase().includes(searchQuery)
    );
    renderProfileButtons(filteredProfiles);
  });

  const initialProfiles = allProfiles.slice(0, 3);
  renderProfileButtons(initialProfiles);

  document.body.appendChild(modal);
}

// Function to fetch and open modal
function fetchAndOpenModal() {
  chrome.storage.sync.get(['profiles', 'proxyEnabled', 'proxyPort', 'proxyToken'], (result) => {
    const { profiles, proxyEnabled, proxyPort, proxyToken } = result;

    if (proxyEnabled) {
      chrome.runtime.sendMessage({ action: "fetchProfilesFromProxy", proxyPort, proxyToken });
    } else {
      openAssumrModal(profiles || []);
    }
  });
}

document.addEventListener('keydown', (event) => {
  chrome.storage.sync.get(['shortcutSettings'], (result) => {
    const savedShortcut = result.shortcutSettings || { cmd: true, option: true, ctrl: false, shift: false, key: 'K' };

    const isCmd = event.metaKey;
    const isOption = event.altKey;
    const isCtrl = event.ctrlKey;
    const isShift = event.shiftKey;
    const pressedKey = event.key.toUpperCase();

    if (
      isCmd === savedShortcut.cmd &&
      isOption === savedShortcut.option &&
      isCtrl === savedShortcut.ctrl &&
      isShift === savedShortcut.shift &&
      pressedKey === savedShortcut.key.toUpperCase()
    ) {
      event.preventDefault();
      fetchAndOpenModal(); // Call the new function
    }
  });
});

console.log("Setting up message listener.");
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "openPopup") {
    fetchAndOpenModal(); // Call the new function
    return true;
  }

  if (req.action === "profilesFetched") {
    openAssumrModal(req.profiles || []);
  }

  if (req.action === "performSwitch") {
    const { profile } = req;

    try {
      const roleMenuButton = document.getElementById('awsc-recent-role-menu');

      if (roleMenuButton) {
        roleMenuButton.click();

        setTimeout(() => {
          const accountInput = document.getElementById('account');
          if (accountInput && profile.roleArn) {
            const accountId = profile.roleArn.split(':')[4];
            accountInput.value = accountId;
            accountInput.dispatchEvent(new Event('input', { bubbles: true }));
          }

          const roleInput = document.getElementById('role');
           if (roleInput && profile.roleArn) {
             const roleName = profile.roleArn.split('/')[1];
            roleInput.value = roleName;
            roleInput.dispatchEvent(new Event('input', { bubbles: true }));
          }

          const switchButton = document.querySelector('button[data-testid=\"switch-button\"]');
          if (switchButton) {
            switchButton.click();
          } else {
             alert("Assumr: Could not find switch role button. UI structure may have changed.");
          }

        }, 500);

      } else {
        alert("Assumr: Could not find the AWS role switch button on this page. UI structure may have changed or you are on an unsupported page.");
      }

    } catch (error) {
      alert("Assumr: An error occurred while trying to switch roles. Please check the browser console for details.");
    }
  }
});
