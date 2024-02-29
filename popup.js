const muteThis = document.getElementById('muteThisTab');
const muteAll = document.getElementById('muteAllTabs');
const muteNewTabs = document.getElementById('muteNewTabs');

const defaultTabMuteKey = 'default'
const defaultMuteAllKey = 'muteAll'

/* Mute a specific tab */
function muteATab(tabId, muted) {
    chrome.storage.local.get([tabId.toString()], function (items) {
        chrome.tabs.update(tabId, { muted: items[tabId] || muted });
    });

    // Set the correct icon based on the mute action
    if (muted) {
        chrome.action.setIcon({ path: "icons/icon-48.png" });
    } else {
        chrome.action.setIcon({ path: "icons/icon-grey-48.png" });
    }
}

/* We ran a mute from this tab so ensure we also update its mute property
   Useful for global mute and unmute */
function mutedFromThisTab(muted) {
    muteThis.checked = muted
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.storage.local.set({ [tabs[0].id.toString()]: muted }, function () { });
        muteATab(tabs[0].id, muted);
    });
}

/* Mute all tabs */
function muteAllTabs(muted) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(function (tab) {
            muteATab(tab.id, muted);
        });
    });
    // Also set the mute for the tab we set this in explicitly
    mutedFromThisTab(muted);
}

/* Listen for changes to the mute tab check box */
muteThis.addEventListener('change', function () {
    mutedFromThisTab(this.checked);
});

/* Listen for changes to the mute all check box */
muteAll.addEventListener('change', function () {
    chrome.storage.local.set({ [defaultMuteAllKey]: this.checked }, function () { });
    muteAllTabs(this.checked);
});

/* Listen for changes to the default new tab check box */
muteNewTabs.addEventListener('change', function () {
    chrome.storage.local.set({ [defaultTabMuteKey]: this.checked }, function () { });
});

/* Get the current state of the mute for the current tab
   Update the popup box UI according to the state */
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    tabId = tabs[0].id.toString();
    chrome.storage.local.get([defaultMuteAllKey, defaultTabMuteKey, tabId], function (items) {
        muteThis.checked = items[tabId];
        muteAll.checked = items[defaultMuteAllKey]
        muteNewTabs.checked = items[defaultTabMuteKey]
    });
});
