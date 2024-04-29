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
          /^\w+$/.test(part) ? part.toUpperCase() : part  // Example transformation, replace with your logic
        );
        pageToSpeech.data.highlightedText = processedWordsArray.join('');
    },

    hasText: () => {
        pageToSpeech.data.highlightedText = window.getSelection().toString().trim();
        return !!pageToSpeech.data.highlightedText;
    },

    trySpeechApi: async () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        await new Promise(resolve => setTimeout(resolve, 100));  // Wait to ensure all voices are loaded
        const utterance = new SpeechSynthesisUtterance(pageToSpeech.data.highlightedText);
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en')) || speechSynthesis.getVoices()[0];
        utterance.onend = () => {
            console.log('Speech synthesis finished.');
            pageToSpeech.data.speechInProgress = false;
        };
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
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

document.addEventListener('mouseup', function(event) {
    if (!isScrambled) {
        return;
    }
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        const btn = document.getElementById('speakButton') || document.createElement('button');
        btn.id = 'speakButton';
        btn.textContent = 'Speak';
        btn.style.position = 'absolute';
        btn.style.left = `${event.pageX - 10}px`;
        btn.style.top = `${event.pageY + 10}px`;
        if (!document.getElementById('speakButton')) {
            document.body.appendChild(btn);
        }

        btn.onclick = function(event) {  // Changed to onclick for better handling
            event.stopPropagation();
            pageToSpeech.initialize();
            document.body.removeChild(btn);
        };
    } else {
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