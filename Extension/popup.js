function saveOptions() {
    const algorithm = document.querySelector('select[name="algorithm"]').value;
    const intensity = document.querySelector('input[name="intensity"]:checked').value;

    chrome.storage.local.set({ algorithm, intensity }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error saving options: ${chrome.runtime.lastError}`);
        } else {
            console.log('Options saved successfully', { algorithm, intensity });
        }
    });
}

function loadOptions() {
    chrome.storage.local.get(['algorithm', 'intensity'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`Error loading options: ${chrome.runtime.lastError}`);
        } else {
            console.log('Loaded options', result);
            if (result.algorithm) {
                document.querySelector('select[name="algorithm"]').value = result.algorithm;
            }
            if (result.intensity) {
                document.querySelector(`input[name="intensity"][value="${result.intensity}"]`).checked = true;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadOptions();

    const algorithmSelect = document.querySelector('select[name="algorithm"]');
    const intensityRadios = document.querySelectorAll('input[name="intensity"]');

    algorithmSelect.addEventListener('change', saveOptions);
    intensityRadios.forEach(radio => radio.addEventListener('change', saveOptions));

    const toggleButton = document.getElementById('toggleButton');

    // Load the scrambled status based on the current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTabId = tabs[0].id;
        chrome.storage.local.get('scrambledTabs', (result) => {
            const isScrambled = result.scrambledTabs && result.scrambledTabs[currentTabId];
            toggleButton.textContent = isScrambled ? 'Restore Text!' : 'Scramble Text!';
        });
    });

    toggleButton.addEventListener('click', function() {
        const startTime = performance.now();  // Start the timer
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTabId = tabs[0].id;
            chrome.storage.local.get('scrambledTabs', (result) => {
                const scrambledTabs = result.scrambledTabs || {};
                const isScrambled = !scrambledTabs[currentTabId];
                scrambledTabs[currentTabId] = isScrambled;

                chrome.storage.local.set({ scrambledTabs }, () => {
                    toggleButton.textContent = isScrambled ? 'Restore Text!' : 'Scramble Text!';
                    const selectedAlgorithm = algorithmSelect.value;
                    const selectedIntensity = Array.from(intensityRadios).find(radio => radio.checked).value;
                    
                    chrome.tabs.sendMessage(currentTabId, {
                        action: isScrambled ? "scramble" : "restore",
                        algorithm: selectedAlgorithm,
                        intensity: selectedIntensity
                    });

                    // Listen for the completion message
                    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                        if (request.action === 'updateComplete') {
                            const endTime = performance.now();  // Stop the timer
                            const duration = endTime - startTime;
                            console.log(`Text update completed in ${duration} milliseconds.`);
                            chrome.runtime.onMessage.removeListener(arguments.callee);  // Remove the listener after completion
                        }
                    });

                    chrome.tabs.sendMessage(currentTabId, {action: "setIsScrambled", isScrambled: isScrambled});
                });

            });
        });
    });
});