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

  const scrambleButton = document.getElementById('scrambleButton');
  const restoreButton = document.getElementById('restoreButton');
  const sendMessageButton = document.getElementById('speechButton');

  scrambleButton.addEventListener('click', function() {
      const selectedAlgorithm = algorithmSelect.value;
      const selectedIntensity = Array.from(intensityRadios).find(radio => radio.checked).value;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "scramble", algorithm: selectedAlgorithm, intensity: selectedIntensity});
      });
  });

  restoreButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "restore"});
      });
  });
  sendMessageButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {action: "pageToSpeech"});
      });
  });
});