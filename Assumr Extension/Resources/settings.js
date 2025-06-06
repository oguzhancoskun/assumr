document.addEventListener('DOMContentLoaded', () => {
  const configInput = document.getElementById('configInput');
  const profileList = document.getElementById('profileList');

  const renderProfiles = (profiles) => {
    profileList.innerHTML = '';
    profiles.forEach((profile, index) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = profile;

      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-danger';
      btn.textContent = 'Delete';
      btn.onclick = () => {
        profiles.splice(index, 1);
        saveAndRender(profiles);
      };

      li.appendChild(btn);
      profileList.appendChild(li);
    });
  };

  const saveAndRender = (profiles) => {
    chrome.storage.sync.set({ profiles }, () => {
      renderProfiles(profiles);
    });
  };

  document.getElementById('parseBtn').addEventListener('click', () => {
    const text = configInput.value;
    const matches = [...text.matchAll(/\[profile\s+([^\]]+)\]/g)];
    const profiles = matches.map(m => m[1]);
    saveAndRender(profiles);
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const items = [...profileList.children].map(li => li.firstChild.textContent);
    chrome.storage.sync.set({ profiles: items }, () => alert('Saved!'));
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.storage.sync.set({ profiles: [] }, () => {
      profileList.innerHTML = '';
    });
  });

  // Load on init
  chrome.storage.sync.get(['profiles'], (result) => {
    if (result.profiles) {
      renderProfiles(result.profiles);
    }
  });
});
