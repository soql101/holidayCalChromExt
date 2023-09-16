// Initialize badge text to an empty string when the extension is installed
chrome.action.setBadgeText({ text: '' });

// Function to update the badge text once a day at the start of the day
function updateBadgeOnceADay() {
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set the time to midnight of the next day

    const timeUntilMidnight = tomorrow - currentDate;

    setTimeout(() => {
        chrome.storage.local.get('selectedCustomDate', (data) => {
            const selectedCustomDate = data.selectedCustomDate;
            if (selectedCustomDate) {
                const holidayDate = new Date(selectedCustomDate + 'T00:00:00'); // Set time to midnight
                const timeRemaining = holidayDate - currentDate;
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
                const badgeText = `${days+1} days`;
                chrome.action.setBadgeText({ text: badgeText });
            }
        });

        // Schedule the next update at the start of the next day
        updateBadgeOnceADay();
    }, timeUntilMidnight);
}

// Call the function to start updating the badge text once a day
updateBadgeOnceADay();

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
