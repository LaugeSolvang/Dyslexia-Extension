function saveOptions(tabId) {
    const algorithm = document.querySelector('select[name="algorithm"]').value;
    const intensity = document.querySelector('input[name="intensity"]:checked').value;
    const key = `options_${tabId}`;

    chrome.storage.local.set({ [key]: { algorithm, intensity } }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error saving options: ${chrome.runtime.lastError}`);
        } else {
            console.log('Options saved successfully for tab', tabId, { algorithm, intensity });
        }
    });
}

function loadOptions(tabId) {
    const key = `options_${tabId}`;
    chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`Error loading options: ${chrome.runtime.lastError}`);
        } else if (result[key]) {
            console.log('Loaded options for tab', tabId, result[key]);
            document.querySelector('select[name="algorithm"]').value = result[key].algorithm;
            document.querySelector(`input[name="intensity"][value="${result[key].intensity}"]`).checked = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            const tabId = tabs[0].id;

            loadOptions(tabId);
            const isScrambledKey = `isScrambled_${tabId}`;

            chrome.storage.local.get([isScrambledKey], (result) => {
                const isScrambled = result[isScrambledKey] || false;
                toggleButton.textContent = isScrambled ? 'Restore Text!' : 'Scramble Text!';
            });

            const algorithmSelect = document.querySelector('select[name="algorithm"]');
            const intensityRadios = document.querySelectorAll('input[name="intensity"]');

            algorithmSelect.addEventListener('change', () => saveOptions(tabId));
            intensityRadios.forEach(radio => radio.addEventListener('change', () => saveOptions(tabId)));

            toggleButton.addEventListener('click', function() {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs.length > 0) {
                        const tabId = tabs[0].id;
                        const isScrambledKey = `isScrambled_${tabId}`;
            
                        chrome.storage.local.get([isScrambledKey], (result) => {
                            const isScrambled = !(result[isScrambledKey] || false);
                            chrome.storage.local.set({ [isScrambledKey]: isScrambled }, () => {
                                toggleButton.textContent = isScrambled ? 'Restore Text!' : 'Scramble Text!';
                                const selectedAlgorithm = algorithmSelect.value;
                                const selectedIntensity = Array.from(intensityRadios).find(radio => radio.checked).value;
            
                                chrome.tabs.sendMessage(tabId, {
                                    action: isScrambled ? "scramble" : "restore",
                                    algorithm: selectedAlgorithm,
                                    intensity: selectedIntensity
                                });
                            });
                        });
                    }
                });
            });
        }
    });
});
