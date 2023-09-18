// Initialize badge text to an empty string when the extension is installed
chrome.action.setBadgeText({ text: '' });

// Function to update the badge text once a day at the start of the day
function updateBadgeEveryHour() {
    const oneHour = 60 * 60 * 1000; // One hour in milliseconds

    // Call the updateBadge function immediately when this is first called
    updateBadge();

    // Schedule the next update every one hour
    setInterval(() => {
        updateBadge();
    }, oneHour);
}

function updateBadge() {
    const currentDate = new Date();

    chrome.storage.local.get('selectedCustomDate', (data) => {
        const selectedCustomDate = data.selectedCustomDate;
        if (selectedCustomDate) {
            const holidayDate = new Date(selectedCustomDate + 'T00:00:00'); // Set time to midnight
            const timeRemaining = holidayDate - currentDate;
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
            const badgeText = `${days + 1}`;
            chrome.action.setBadgeText({ text: badgeText });
        }
    });
}

// Call the function to start updating the badge every hour
updateBadgeEveryHour();

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
