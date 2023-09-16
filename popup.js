// Define customDatesList as a global variable
let customDatesList;

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

// Function to remove a custom date from the list and update Chrome storage
function removeCustomDate(customDate) {
    chrome.storage.local.get(['customDates', 'selectedCustomDate'], (data) => {
        if (!chrome.runtime.lastError) {
            const customDates = new Set(data.customDates || []);
            if (customDates.has(customDate)) {
                customDates.delete(customDate);
                chrome.storage.local.set({ customDates: Array.from(customDates) }, () => {
                    // Remove the list item from the UI
                    const listItem = document.querySelector(`li input[value="${customDate}"]`).parentNode;
                    listItem.remove();

                    const selectedCustomDate = data.selectedCustomDate;

                    // Check if the removed date was the selected date
                    if (selectedCustomDate === customDate) {
                        updateBadgeText(null); // Clear the badge text
                        // Clear the selected custom date in chrome.storage.local
                        chrome.storage.local.remove('selectedCustomDate');
                    } else if (selectedCustomDate) {
                        // If a different date was selected, update the badge text with the selected date
                        updateBadgeText(selectedCustomDate);
                    }
                });
            }
        } else {
            console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
        }
    });
}

// Function to create a delete button and add it to the list item
function createDeleteButton(listItem, customDate) {
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', () => {
        removeCustomDate(customDate);
    });
    listItem.appendChild(deleteButton);
}

document.addEventListener('DOMContentLoaded', function () {
    const customDateInput = document.getElementById('custom-date-input');
    customDatesList = document.getElementById('custom-dates-list'); // Assign to the global variable

    // Event listener for the "Track" button
    const trackCustomDateButton = document.getElementById('track-custom-date');
    trackCustomDateButton.addEventListener('click', function () {
        const customDate = customDateInput.value;
    
        if (customDate) {
            chrome.storage.local.get('customDates', (data) => {
                if (!chrome.runtime.lastError) {
                    const customDates = new Set(data.customDates || []);
                    const selectedCustomDate = customDatesList.querySelector('input[name="custom-date-radio"]:checked');
    
                    if (selectedCustomDate) {
                        const previousSelectedDate = selectedCustomDate.value;
    
                        // Remove the selection from the previous date
                        selectedCustomDate.checked = false;
    
                        // If the new date is different from the previous date, update the badge text for the new date
                        if (customDate !== previousSelectedDate) {
                            updateBadgeText(customDate);
                        }
                    } else {
                        // If no previous date was selected, simply update the badge text for the new date
                        // Add a condition to check if a date is selected from the list
                        if (customDates.has(customDate)) {
                            updateBadgeText(customDate);
                        }
                    }
    
                    if (!customDates.has(customDate)) {
                        customDates.add(customDate);
                        chrome.storage.local.set({ customDates: Array.from(customDates) }, () => {
                            const listItem = document.createElement('li');
                            const radioBtn = document.createElement('input');
                            radioBtn.type = 'radio';
                            radioBtn.name = 'custom-date-radio';
                            radioBtn.value = customDate;
                            listItem.appendChild(radioBtn);
                            listItem.appendChild(document.createTextNode(customDate));
    
                            // Add a delete button next to the custom date
                            createDeleteButton(listItem, customDate);
    
                            customDatesList.appendChild(listItem);
                        });
                    }
                } else {
                    console.error('Error accessing Chrome storage:', chrome.runtime.lastError);
                }
            });
        }
    });
    

    // Event listener for the radio buttons
    customDatesList.addEventListener('change', function () {
        const selectedCustomDate = customDatesList.querySelector('input[name="custom-date-radio"]:checked');
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
                const listItem = document.createElement('li');
                const radioBtn = document.createElement('input');
                radioBtn.type = 'radio';
                radioBtn.name = 'custom-date-radio';
                radioBtn.value = customDate;
                listItem.appendChild(radioBtn);
                listItem.appendChild(document.createTextNode(customDate));

                // Add a delete button next to the custom date
                createDeleteButton(listItem, customDate);

                customDatesList.appendChild(listItem);
            });

            // Set the selected radio button based on the stored custom date
            if (selectedCustomDate) {
                const radioBtn = customDatesList.querySelector('input[value="' + selectedCustomDate + '"]');
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
