/*
let btn; 

document.addEventListener('mouseup', function(e) {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        if (!btn) {
            btn = document.createElement('button');
            btn.textContent = 'Click Me!';
            document.body.appendChild(btn);

            btn.addEventListener('click', function() {
                pageToSpeech.data.highlightedText = selectedText; 
                pageToSpeech.trySpeechApi().then(() => {
                    document.body.removeChild(btn); 
                    btn = null; 
                });
            });
        }
        btn.style.position = 'absolute';
        btn.style.left = `${e.pageX}px`;
        btn.style.top = `${e.pageY}px`;
    }
});

document.addEventListener('click', function(e) {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText.length === 0 && btn) {
        document.body.removeChild(btn);
        btn = null; 
    }
});
*/
const pageToSpeech = {
    data: {
        highlightedText: '',
        speechInProgress: false,
        fallbackAudio: null,
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
        pageToSpeech.data.highlightedText = window.getSelection().toString();
        if (!pageToSpeech.data.highlightedText) {
            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.id = "sandbox";
            document.getElementsByTagName("body")[0].appendChild(input);
            const sandbox = document.getElementById("sandbox");
            sandbox.value = "";
            sandbox.style.opacity = 0;
            sandbox.focus();
            if (document.execCommand('paste')) {
                pageToSpeech.data.highlightedText = sandbox.value;
            }
            sandbox.parentNode.removeChild(sandbox);
        }
        return !!pageToSpeech.data.highlightedText;
    },

    trySpeechApi: async () => {
        if (pageToSpeech.data.speechInProgress) {
            pageToSpeech.data.audio.pause();
        }
        const apiUrl = 'https://voiceservice.vitec-mv.com/v1/Voice/Speak';
        const payload = {
            format: "mp3",
            speed: 1.0,
            text: pageToSpeech.data.highlightedText,
            type: "Math",
            voiceID: "mv_en_crb"
        };

        pageToSpeech.data.speechInProgress = true;
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
            pageToSpeech.data.audio = new Audio(audioUrl);
            pageToSpeech.data.audio.play();
            pageToSpeech.data.audio.onended = () => {
                pageToSpeech.data.speechInProgress = false;
            };
        } catch (error) {
            console.error('Error with speech API:', error);
            alert("Failed to fetch speech audio.");
        }
    },

    addHotkeys: () => {
        const activeKeys = {};
        window.onkeydown = window.onkeyup = evt => {
            const e = evt || window.event;
            activeKeys[e.keyCode] = e.type === 'keydown';
            if (activeKeys[16] && activeKeys[84]) { // Shift + T
                pageToSpeech.initialize();
            }
        };
    },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'pageToSpeech') {
        console.log('Received request for page to speech');
        pageToSpeech.initialize();
    }
});

pageToSpeech.addHotkeys();