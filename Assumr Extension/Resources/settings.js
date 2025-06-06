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

      const blocks = text.split(/\[profile\s+([^\]]+)\]/g).slice(1); // alternating [name, content, name, content...]
      const profiles = [];

      for (let i = 0; i < blocks.length; i += 2) {
        const profileName = blocks[i].trim();
        const content = blocks[i + 1];
        const roleArn = (content.match(/role_arn\s*=\s*(.+)/) || [])[1]?.trim();
        const sourceProfile = (content.match(/source_profile\s*=\s*(.+)/) || [])[1]?.trim();
        const region = (content.match(/region\s*=\s*(.+)/) || [])[1]?.trim();

        if (roleArn && sourceProfile) {
          profiles.push({ profile: profileName, roleArn, sourceProfile, region });
        }
      }

      chrome.storage.sync.set({ profiles }, () => {
        renderProfiles(profiles.map(p => p.profile));
      });
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
