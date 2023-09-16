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

    // Store the selected custom date in local storage
    chrome.storage.local.set({ selectedCustomDate: customDate });
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

    // Function to display custom dates as radio buttons
    function displayCustomDatesAsRadioButtons(customDates) {
        const customDatesList = document.getElementById('custom-dates-list');
        if (!customDatesList) return; // Ensure that customDatesList is defined

        customDatesList.innerHTML = ''; // Clear the list

        const uniqueCustomDates = new Set(customDates); // Use a Set to store unique custom dates

        uniqueCustomDates.forEach((customDate) => {
            displayCustomDateAsRadioButton(customDate);
        });
    }

    // Function to set the selected radio button based on the stored custom date
    function setSelectedRadioButton(selectedCustomDate) {
        const radioButtons = customDatesForm.querySelectorAll('input[name="custom-date-radio"]');
        for (const radioButton of radioButtons) {
            if (radioButton.value === selectedCustomDate) {
                radioButton.checked = true;
                updateBadgeText(selectedCustomDate); // Update badge with the stored custom date
                break;
            }
        }
    }

    // Event listener for the "Track" button
    const trackCustomDateButton = document.getElementById('track-custom-date');
    trackCustomDateButton.addEventListener('click', function () {
        const customDate = customDateInput.value;
        const customDatesList = document.getElementById('custom-dates-list');
        const customDates = Array.from(customDatesList.querySelectorAll('li input')).map(input => input.value);
        
        if (!customDates.includes(customDate)) {
            updateBadgeText(customDate);
            displayCustomDateAsRadioButton(customDate);
        }
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
    chrome.storage.local.get(['customDates', 'selectedCustomDate'], (data) => {
        if (!chrome.runtime.lastError) {
            const customDates = data.customDates || [];
            displayCustomDatesAsRadioButtons(customDates);

            const selectedCustomDate = data.selectedCustomDate;
            if (selectedCustomDate) {
                setSelectedRadioButton(selectedCustomDate);
            }
        } else {
            console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
        }
    });
});
