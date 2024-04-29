let isScrambled = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "setIsScrambled") {
        isScrambled = request.isScrambled;
    }
});

const pageToSpeech = {
    data: {
        highlightedText: '',
        speechInProgress: false,
    },

    initialize: async () => {
        console.log('Initializing pageToSpeech...');
        if (!pageToSpeech.hasText()) {
            return;
        }
            
        pageToSpeech.processText(); 
    
        await pageToSpeech.trySpeechApi();
    },

    processText: () => { 
        let inputText = pageToSpeech.data.highlightedText;
        let wordsArray = inputText.split(/(\W+)/).filter(part => part.length > 0);
        let processedWordsArray = wordsArray.map(part => 
          /^\w+$/.test(part) ? activateTTSForWord(part) : part
        );
        pageToSpeech.data.highlightedText = processedWordsArray.join('');
    },

    hasText: () => {
        pageToSpeech.data.highlightedText = window.getSelection().toString().trim(); // Trim to remove any extra whitespace
        return !!pageToSpeech.data.highlightedText;
    },

    trySpeechApi: async () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Cancel any ongoing speech
        }
        const utterance = new SpeechSynthesisUtterance(pageToSpeech.data.highlightedText);
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en'));
        utterance.onend = () => {
            console.log('Speech synthesis finished.');
            pageToSpeech.data.speechInProgress = false;
        };
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            alert("An error occurred during speech output.");
        };

        speechSynthesis.speak(utterance);
        pageToSpeech.data.speechInProgress = true;
    },

    addHotkeys: () => {
        const activeKeys = {};
        window.onkeydown = window.onkeyup = evt => {
            const e = evt || window.event;
            activeKeys[e.keyCode] = e.type === 'keydown';
            if (activeKeys[16] && activeKeys[84]) { // Shift + T
                if (!isScrambled) {
                    return;
                }
                pageToSpeech.initialize();
            }
        };
    },
};

// Initialize the pageToSpeech when text is selected and isScrambled is true
document.addEventListener('mouseup', function(event) {
    if (!isScrambled) {
        return;
    }
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        // Create and display the button if not already present
        if (!document.getElementById('speakButton')) {
            const btn = document.createElement('button');
            btn.id = 'speakButton';
            btn.textContent = 'Speak';
            btn.style.position = 'absolute';
            btn.style.left = `${event.pageX - 10}px`;
            btn.style.top = `${event.pageY + 10}px`;
            document.body.appendChild(btn);

            btn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent event propagation
                pageToSpeech.initialize();
                document.body.removeChild(btn);
            });
        }
    } else {
        // Remove button if no text is selected
        const existingButton = document.getElementById('speakButton');
        if (existingButton) {
            document.body.removeChild(existingButton);
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'pageToSpeech') {
        console.log('Received request for page to speech');
        pageToSpeech.initialize();
    }
});

pageToSpeech.addHotkeys();