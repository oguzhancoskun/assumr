// Simple hashing function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// A larger palette of colors
const colorPalette = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
  '#393b79', '#637939', '8c6d31', '#843c39', '#7b4173', '#6b6ecf', '#9c9ede', '#cedb9c', '#e7969c', '#7b9aa2',
  '#b5cf6b', '#ce6dbd', '#de9ed6', '3182bd', '6baed6', '9ecae1', 'c6dbef', 'e6550d', 'fd8d3c', 'fdae6b',
  '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', 'dadaeb', '#636363',
  '#969696', '#bdbdbd', '#d9d9d9', '#a55194', '#ce6a8b', '#dadaeb', '#e7ba52', '#bd9e39', '#e7cb94', '843c39',
  '#ad494a', '#d6616b', '#e7969c', '#7b4173', 'a55194', '#ce6dbd', 'de9ed6', '393b79', '5254a3', '6b6ecf',
  '#9c9ede', '#637939', '8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', 'e7cb94', '843c39'
];

function getRandomColor() {
  const colors = ['#e74c3c', '#8e44ad', '#3498db', '#1abc9c', '#f39c12', '#d35400', '#2ecc71'];
  return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('DOMContentLoaded', () => {
  const configInput = document.getElementById('configInput');
  const profileList = document.getElementById('profileList');
  const manualConfigSection = document.getElementById('manualConfigSection');

  const proxyEnabledCheckbox = document.getElementById('proxyEnabled');
  const proxyPortInput = document.getElementById('proxyPort');
  const proxyTokenInput = document.getElementById('proxyToken');
  const proxySettingsFields = document.getElementById('proxySettingsFields');
  const testProxyBtn = document.getElementById('testProxyBtn');
  const proxyTestStatusSpan = document.getElementById('proxyTestStatus');

  const shortcutCmdCheckbox = document.getElementById('shortcutCmd');
  const shortcutOptionCheckbox = document.getElementById('shortcutOption');
  const shortcutCtrlCheckbox = document.getElementById('shortcutCtrl');
  const shortcutShiftCheckbox = document.getElementById('shortcutShift');
  const shortcutKeyInput = document.getElementById('shortcutKey');
  const saveShortcutBtn = document.getElementById('saveShortcutBtn');
  const shortcutStatusSpan = document.getElementById('shortcutStatus');

  let parsedProfiles = [];

  const renderProfiles = (profilesToRender) => {
    parsedProfiles = profilesToRender;
    profileList.innerHTML = '';
    profilesToRender.forEach((profile, index) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = profile.profile;

      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-danger';
      btn.textContent = 'Delete';
      btn.onclick = () => {
        parsedProfiles.splice(index, 1);
        saveAndRender(parsedProfiles);
      };

      li.appendChild(btn);
      profileList.appendChild(li);
    });
  };

  const saveAndRender = (profilesToSave) => {
    chrome.storage.sync.set({ profiles: profilesToSave }, () => {
      renderProfiles(profilesToSave);
    });
  };

  const toggleManualConfigVisibility = () => {
    const isProxyEnabled = proxyEnabledCheckbox.checked;
    manualConfigSection.style.display = isProxyEnabled ? 'none' : 'block';
    proxySettingsFields.style.display = isProxyEnabled ? 'block' : 'none';
    saveProxySettings();
  };

  const saveProxySettings = () => {
      chrome.storage.sync.set({
          proxyEnabled: proxyEnabledCheckbox.checked,
          proxyPort: proxyPortInput.value,
          proxyToken: proxyTokenInput.value
      });
  };

  const loadProxySettings = () => {
      chrome.storage.sync.get(['proxyEnabled', 'proxyPort', 'proxyToken'], (result) => {
          if (result.proxyEnabled !== undefined) {
              proxyEnabledCheckbox.checked = result.proxyEnabled;
          }
          if (result.proxyPort !== undefined) {
              proxyPortInput.value = result.proxyPort;
          }
          if (result.proxyToken !== undefined) {
              proxyTokenInput.value = result.proxyToken;
          }
          toggleManualConfigVisibility();
      });
  };

  const saveShortcutSettings = () => {
      const shortcutSettings = {
          cmd: shortcutCmdCheckbox.checked,
          option: shortcutOptionCheckbox.checked,
          ctrl: shortcutCtrlCheckbox.checked,
          shift: shortcutShiftCheckbox.checked,
          key: shortcutKeyInput.value.toUpperCase()
      };
      chrome.storage.sync.set({ shortcutSettings }, () => {
          shortcutStatusSpan.textContent = 'Shortcut saved!';
          shortcutStatusSpan.style.color = '#28a745';
          setTimeout(() => { shortcutStatusSpan.textContent = ''; }, 3000);
      });
  };

  const loadShortcutSettings = () => {
      chrome.storage.sync.get(['shortcutSettings'], (result) => {
          const settings = result.shortcutSettings;
          if (settings) {
              shortcutCmdCheckbox.checked = settings.cmd || false;
              shortcutOptionCheckbox.checked = settings.option || false;
              shortcutCtrlCheckbox.checked = settings.ctrl || false;
              shortcutShiftCheckbox.checked = settings.shift || false;
              shortcutKeyInput.value = settings.key || '';
          } else {
              shortcutCmdCheckbox.checked = true;
              shortcutOptionCheckbox.checked = true;
              shortcutCtrlCheckbox.checked = false;
              shortcutShiftCheckbox.checked = false;
              shortcutKeyInput.value = 'K';
          }
      });
  };

  proxyEnabledCheckbox.addEventListener('change', toggleManualConfigVisibility);
  proxyPortInput.addEventListener('input', saveProxySettings);
  proxyTokenInput.addEventListener('input', saveProxySettings);

  testProxyBtn.addEventListener('click', () => {
      proxyTestStatusSpan.textContent = 'Testing...';
      proxyTestStatusSpan.style.color = '#ffc107';

      const proxyPort = proxyPortInput.value;
      const proxyToken = proxyTokenInput.value;

      chrome.runtime.sendMessage({ action: "testProxyConnection", proxyPort, proxyToken });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "proxyTestResult") {
          if (request.success) {
              proxyTestStatusSpan.textContent = 'Connection successful!';
              proxyTestStatusSpan.style.color = '#28a745';
          } else {
              proxyTestStatusSpan.textContent = 'Connection failed.';
              proxyTestStatusSpan.style.color = '#dc3545';
          }
      }
  });

    document.getElementById('parseBtn').addEventListener('click', () => {
      const text = configInput.value;

      const blocks = text.split(/\[profile\s+([^\]]+)\]/g).slice(1);
      const profiles = [];

      for (let i = 0; i < blocks.length; i += 2) {
        const profileName = blocks[i].trim();
        const content = blocks[i + 1];
        const roleArn = (content.match(/role_arn\s*=\s*(.+)/) || [])[1]?.trim();
        const sourceProfile = (content.match(/source_profile\s*=\s*(.+)/) || [])[1]?.trim();
        const region = (content.match(/region\s*=\s*(.+)/) || [])[1]?.trim();

        if (roleArn && sourceProfile) {
          const colorIndex = simpleHash(profileName) % colorPalette.length;
          profiles.push({ profile: profileName, roleArn, sourceProfile, region, color: colorPalette[colorIndex] });
        }
      }

      chrome.storage.sync.set({ profiles }, () => {
        renderProfiles(profiles);
      });
    });


  document.getElementById('saveBtn').addEventListener('click', () => {
    chrome.storage.sync.set({ profiles: parsedProfiles }, () => alert('Saved!'));
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.sync.set({ profiles: [] }, () => {
      renderProfiles([]);
    });
  });

  chrome.storage.sync.get(['profiles'], (result) => {
    if (result.profiles) {
      renderProfiles(result.profiles);
    }
  });

  loadProxySettings();

  loadShortcutSettings();

});
