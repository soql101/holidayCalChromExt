// Initialize badge text to an empty string when the extension is installed
chrome.action.setBadgeText({ text: '' });

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateBadgeText') {
        const { text } = message;
        chrome.action.setBadgeText({ text });
    }

    if (message.type === 'addCustomDate') {
        const { customDate } = message;

        // Add the custom date to the storage
        chrome.storage.local.get('customDates', (data) => {
            const customDates = data.customDates || [];
            customDates.push(customDate);
            chrome.storage.local.set({ customDates });
        });
    }
});
