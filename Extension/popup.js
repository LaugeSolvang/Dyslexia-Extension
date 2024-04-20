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

    chrome.storage.local.get('isScrambled', (result) => {
        toggleButton.textContent = result.isScrambled ? 'Restore Text!' : 'Scramble Text!';
    });

    toggleButton.addEventListener('click', function() {
        chrome.storage.local.get('isScrambled', (result) => {
            const isScrambled = !result.isScrambled;
            chrome.storage.local.set({ isScrambled }, () => {
                toggleButton.textContent = isScrambled ? 'Restore Text!' : 'Scramble Text!';
                const selectedAlgorithm = algorithmSelect.value;
                const selectedIntensity = Array.from(intensityRadios).find(radio => radio.checked).value;
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (isScrambled) {
                        chrome.tabs.sendMessage(tabs[0].id, {action: "scramble", algorithm: selectedAlgorithm, intensity: selectedIntensity});
                    } else {
                        chrome.tabs.sendMessage(tabs[0].id, {action: "restore"});
                    }
                    chrome.tabs.sendMessage(tabs[0].id, {action: "setIsScrambled", isScrambled: isScrambled});
                });
            });
        });
    });
});