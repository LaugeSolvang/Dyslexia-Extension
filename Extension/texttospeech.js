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
            pageToSpeech.data.Audio.pause();
        }
        pageToSpeech.data.speechInProgress = true;
        pageToSpeech.data.Audio = new Audio(`http://api.voicerss.org/?key=1f0f6e3bf29646baa68bfb9c1d27e10a&src=${encodeURIComponent(pageToSpeech.data.highlightedText)}`);
        pageToSpeech.data.Audio.addEventListener("error", evt => {
            alert("Sorry, we cannot produce speech right now. Try upgrading your browser!");
        });
        pageToSpeech.data.Audio.play();
        pageToSpeech.data.Audio.onended = () => {
            pageToSpeech.data.speechInProgress = false;
        };
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