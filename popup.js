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
}

// Function to display a custom date as a radio button in the list
function displayCustomDateAsRadioButton(customDate) {
    const listItem = document.createElement('li');
    const radioBtn = document.createElement('input');
    radioBtn.type = 'radio';
    radioBtn.name = 'custom-date-radio';
    radioBtn.value = customDate;
    listItem.appendChild(radioBtn);
    listItem.appendChild(document.createTextNode(customDate));

    // Ensure that customDatesList is defined before appending to it
    const customDatesList = document.getElementById('custom-dates-list');
    if (customDatesList) {
        customDatesList.appendChild(listItem);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const customDateInput = document.getElementById('custom-date-input');
    const customDatesForm = document.getElementById('custom-dates-form');

    // Event listener for the "Track" button
    const trackCustomDateButton = document.getElementById('track-custom-date');
    trackCustomDateButton.addEventListener('click', function () {
        const customDate = customDateInput.value;

        if (customDate) {
            chrome.storage.local.get('customDates', (data) => {
                if (!chrome.runtime.lastError) {
                    const customDates = new Set(data.customDates || []);
                    if (!customDates.has(customDate)) {
                        customDates.add(customDate);
                        chrome.storage.local.set({ customDates: Array.from(customDates) }, () => {
                            displayCustomDateAsRadioButton(customDate);
                            // Do not automatically check the newly added radio button
                            updateBadgeText(null);
                        });
                    }
                } else {
                    console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
                }
            });
        }
    });

    // Event listener for the radio buttons
    customDatesForm.addEventListener('change', function () {
        const selectedCustomDate = customDatesForm.querySelector('input[name="custom-date-radio"]:checked');
        if (selectedCustomDate) {
            const customDate = selectedCustomDate.value;
            updateBadgeText(customDate);
            // Store the selected custom date in chrome.storage.local
            chrome.storage.local.set({ selectedCustomDate: customDate });
        } else {
            updateBadgeText(null); // Clear badge text
            // Clear the selected custom date in chrome.storage.local
            chrome.storage.local.remove('selectedCustomDate');
        }
    });

    // When the popup is opened, retrieve and display custom dates
    chrome.storage.local.get(['customDates', 'selectedCustomDate'], (data) => {
        if (!chrome.runtime.lastError) {
            const customDates = data.customDates || [];
            const selectedCustomDate = data.selectedCustomDate;

            // Display custom dates in the list
            customDates.forEach((customDate) => {
                displayCustomDateAsRadioButton(customDate);
            });

            // Set the selected radio button based on the stored custom date
            if (selectedCustomDate) {
                const radioBtn = customDatesForm.querySelector('input[value="' + selectedCustomDate + '"]');
                if (radioBtn) {
                    radioBtn.checked = true;
                    updateBadgeText(selectedCustomDate); // Update badge with the stored custom date
                }
            }
        } else {
            console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
        }
    });
});
