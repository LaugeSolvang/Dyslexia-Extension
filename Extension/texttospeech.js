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
        Audio: null,
    },

    initialize: async (method = 'browser') => {
        console.log('Initializing pageToSpeech using method:', method);
        if (!pageToSpeech.hasText()) {
            return;
        }
            
        pageToSpeech.processText(); 
        await pageToSpeech.trySpeechApi(method);
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
        pageToSpeech.data.highlightedText = window.getSelection().toString().trim();
        return !!pageToSpeech.data.highlightedText;
    },

    trySpeechApi: async (method) => {
        if (pageToSpeech.data.speechInProgress) {
            if (pageToSpeech.data.Audio) {
                pageToSpeech.data.Audio.pause();
            }
            speechSynthesis.cancel(); // Cancel any ongoing speech synthesis
        }

        pageToSpeech.data.speechInProgress = true;

        switch (method) {
            case 'browser':
                await ensureVoicesLoaded();  // Ensure voices are loaded
                const utterance = new SpeechSynthesisUtterance(pageToSpeech.data.highlightedText);
                utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en')) || speechSynthesis.getVoices()[0];
                utterance.onend = () => console.log('Speech synthesis finished.');
                utterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event.error);
                    alert("An error occurred during speech output.");
                };
                speechSynthesis.speak(utterance);
                break;
            case 'voicerss':
                pageToSpeech.data.Audio = new Audio(`http://api.voicerss.org/?key=1f0f6e3bf29646baa68bfb9c1d27e10a&src=${encodeURIComponent(pageToSpeech.data.highlightedText)}`);
                pageToSpeech.data.Audio.onended = () => pageToSpeech.data.speechInProgress = false;
                pageToSpeech.data.Audio.onerror = () => {
                    alert("Sorry, we cannot produce speech right now. Try upgrading your browser!");
                };
                pageToSpeech.data.Audio.play();
                break;
            case 'vitec':
                const apiUrl = 'https://voiceservice.vitec-mv.com/v1/Voice/Speak';
                const payload = {
                    format: "mp3",
                    speed: 1.0,
                    text: pageToSpeech.data.highlightedText,
                    type: "Math",
                    voiceID: "mv_en_crb"
                };

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'SessionID': 'bb974b47-3a4f-49b9-aced-db7b533861c5'  
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    const audioUrl = `https://voiceservice.vitec-mv.com/${data.soundLink}`;
                    pageToSpeech.data.Audio = new Audio(audioUrl);
                    pageToSpeech.data.Audio.play();
                    pageToSpeech.data.Audio.onended = () => pageToSpeech.data.speechInProgress = false;
                } catch (error) {
                    console.error('Error with speech API:', error);
                    alert("Failed to fetch speech audio.");
                }
                break;
            default:
                console.error('Invalid method for speech synthesis');
                alert('Selected method for speech synthesis is not supported.');
                pageToSpeech.data.speechInProgress = false;
        }
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
                pageToSpeech.initialize('browser'); // defaults to using the browser's speech synthesis
            }
        };
    },
};

function ensureVoicesLoaded() {
    return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
            };
        }
    });
}

document.addEventListener('mouseup', function(event) {
    if (!isScrambled) {
        return;
    }
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        const existingButton = document.getElementById('speakButton');
        if (!existingButton) {

            const btn = document.createElement('button');
            btn.id = 'speakButton';
            btn.style.position = 'absolute';
            btn.style.left = `${event.pageX - 35}px`;
            btn.style.top = `${event.pageY - 35}px`;
    
            // Create an img element with the src from your extension
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL('introduction-to-speech.png'); // Adjust path as needed
            img.style.width = '24px';
            img.style.height = '24px';
            img.style.marginRight = '8px';
            img.alt = 'Speak';
    
            btn.appendChild(img);
            btn.appendChild(document.createTextNode('Speak'));
    
            document.body.appendChild(btn);
    
            let buttonJustCreated = true; // Flag to prevent immediate removal

            setTimeout(() => buttonJustCreated = false, 3); // Reset flag after short delay

            btn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent event propagation
                pageToSpeech.initialize('browser'); // defaults to using the browser's speech synthesis
                document.body.removeChild(btn);
            });

            document.addEventListener('click', function outsideClickListener(event) {
                if (!btn.contains(event.target) && !buttonJustCreated) {
                    document.body.removeChild(btn);
                    document.removeEventListener('click', outsideClickListener);
                }
            }, true);

            document.addEventListener('dblclick', function(event) {
                if (btn.contains(event.target)) {
                    document.body.removeChild(btn);
                }
            }, true);

            // Check after 50ms if text is still highlighted, and if not, do not remove the button
            setTimeout(() => {
                const currentSelectedText = window.getSelection().toString().trim();
                if (currentSelectedText.length === 0) {
                    if (existingButton) {
                        document.body.removeChild(existingButton);
                    }
                }
            }, 50);

        }
    } else {
        if (existingButton) {
            document.body.removeChild(existingButton);
        }
    }
});


pageToSpeech.addHotkeys();