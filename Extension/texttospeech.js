let isScrambled = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "setIsScrambled") {
        isScrambled = request.isScrambled;
        console.log('isScrambled:', isScrambled);
    }
});

const pageToSpeech = {
    data: {
        highlightedText: '',
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

    // Initialize the pageToSpeech when text is selected
    initialize: (event) => {
        const existingButton = document.getElementById('speakButton');
        if (existingButton) {
            document.body.removeChild(existingButton);
        }

        if (!isScrambled) {
            return;
        }
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
            pageToSpeech.data.highlightedText = selectedText;

            // Create and display the button if not already present
            if (!document.getElementById('speakButton')) {
                const btn = document.createElement('button');
                btn.id = 'speakButton';
                btn.textContent = 'Speak';
                btn.style.position = 'absolute';
                btn.style.left = `${event.pageX-10}px`;
                btn.style.top = `${event.pageY+10}px`;
                document.body.appendChild(btn);

                btn.addEventListener('click', function() {
                    pageToSpeech.trySpeechApi();
                    document.body.removeChild(btn); 
                });
            }
        }
    },
};

// Event listener for text selection
document.addEventListener('mouseup', pageToSpeech.initialize);
document.addEventListener('keyup', pageToSpeech.initialize);