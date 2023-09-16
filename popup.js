// Function to calculate and update the badge text based on custom date
function updateBadgeText(customDate) {
    // Check if the custom date input is empty or not in a valid date format
    if (!customDate || !/^\d{4}-\d{2}-\d{2}$/.test(customDate)) {
        chrome.runtime.sendMessage({ type: 'updateBadgeText', text: '' }); // Clear badge text
        return;
    }

    const currentDate = new Date();
    const holidayDate = new Date(customDate + 'T00:00:00'); // Set time to midnight
    const timeRemaining = holidayDate - currentDate;
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

    // Send a message to the background script to update the badge text
    chrome.runtime.sendMessage({ type: 'updateBadgeText', text: `${days}` });

    // Send a message to the background script to add the custom date
    chrome.runtime.sendMessage({ type: 'addCustomDate', customDate });
}

document.addEventListener('DOMContentLoaded', function () {
    const customDateInput = document.getElementById('custom-date-input');
    const customDatesList = document.getElementById('custom-dates-list');
    const customDatesForm = document.getElementById('custom-dates-form');

    // Function to display custom dates as radio buttons
    function displayCustomDatesAsRadioButtons(customDates) {
        customDatesList.innerHTML = '';
        customDates.forEach((customDate) => {
            const listItem = document.createElement('li');
            const radioBtn = document.createElement('input');
            radioBtn.type = 'radio';
            radioBtn.name = 'custom-date-radio';
            radioBtn.value = customDate;
            listItem.appendChild(radioBtn);
            listItem.appendChild(document.createTextNode(customDate));
            customDatesList.appendChild(listItem);
        });
    }

    // Event listener for the "Track" button
    const trackCustomDateButton = document.getElementById('track-custom-date');
    trackCustomDateButton.addEventListener('click', function () {
        const customDate = customDateInput.value;
        updateBadgeText(customDate);
    });

    // Event listener for the radio buttons
    customDatesForm.addEventListener('change', function () {
        const selectedCustomDate = customDatesForm.querySelector('input[name="custom-date-radio"]:checked');
        if (selectedCustomDate) {
            const customDate = selectedCustomDate.value;
            updateBadgeText(customDate);
        } else {
            updateBadgeText(null); // Clear badge text
        }
    });

    // When the popup is opened, retrieve and display custom dates
    chrome.storage.local.get('customDates', (data) => {
        if (!chrome.runtime.lastError) {
            const customDates = data.customDates || [];
            displayCustomDatesAsRadioButtons(customDates);
        } else {
            console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
        }
    });
});
