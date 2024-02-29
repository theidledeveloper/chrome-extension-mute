const defaultTabMute = false
const defaultGlobalTabMute = false
const defaultTabMuteKey = 'default'
const muteAllKey = 'muteAll'

/* Set the mute setting a a single tab */
function storeTabMuteSetting(tabId, muted) {
    chrome.storage.local.set({ [tabId.toString()]: muted }, function () { });
}

/* Set the mute all setting a a single tab */
function storeGlobalMuteSetting(muted) {
    chrome.storage.local.set({ [muteAllKey]: muted }, function () { });
}

/* For debugging */
/* chrome.storage.local.clear(function() {
    console.log('Local storage data cleared.');
}); */

/* On extension load
   Loop through all current tabs
   Check if the tabs already have a state (from a reinstall)
   Set all current tabs to there setting or the default */
chrome.tabs.query({}, (tabs) => {
    chrome.storage.local.get([defaultTabMuteKey], function (items) {
        var defaultMute = defaultTabMute;
        if (items[defaultTabMuteKey] !== undefined) {
            defaultMute = items[defaultTabMuteKey];
        }
        tabs.forEach(function (tab) {
            currentTabMute = defaultMute;
            chrome.storage.local.get([tab.id.toString()], function (items) {
                if (items[tab.id] !== undefined) {
                    currentTabMute = items[tab.id];
                }
                chrome.tabs.update(tab.id, { muted: currentTabMute });
                storeTabMuteSetting(tab.id, currentTabMute);
            });
        });
    });
    storeGlobalMuteSetting(defaultGlobalTabMute);
});

/* When a tab is removed, we also remove it from the extension storage to reduce space */
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(tabId.toString());
});

/* When a tab is created, mute it if all is set to true and set up the tab specific storage */
chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get([muteAllKey, defaultTabMuteKey], function (items) {
        var tabMute = items[defaultTabMuteKey] || items[muteAllKey];
        chrome.tabs.update(tab.id, { muted: tabMute });
        updateIcon()
        storeTabMuteSetting(tab.id, tabMute)
    });
});

/* Ensure we update the icon for each tab load */
chrome.tabs.onUpdated.addListener(updateIcon);
chrome.tabs.onActivated.addListener(updateIcon);

/* Update the icon depending on the mute status of the tab
   Add a music note if sound is playing so the users know if they unmute */
function updateIcon() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (tabs.length == 0) return;
        if (tabs[0].mutedInfo.muted) {
            chrome.action.setIcon({ path: "icons/icon-48.png" });
        } else {
            chrome.action.setIcon({ path: "icons/icon-grey-48.png" });
        }
        if (tabs[0].audible) {
            chrome.action.setBadgeText({text: '♪'});
        } else {
            chrome.action.setBadgeText({text: ""});
        }
    });
}
