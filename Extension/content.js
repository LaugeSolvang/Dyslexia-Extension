let wordsDict = {};
let pattern_dict = {};
let neglectDict = {};
let originalWordLookup = new Map();

function getPatternKey(word) {
    return word[0] + word.slice(1, -1).split('').sort().join('') + word[word.length - 1];
}

function applyOriginalCase(original, modified) {
    if (original.toLowerCase() === modified.toLowerCase()) {
        return original;
    } else if (original === original.toUpperCase()) {
        return modified.toUpperCase();
    } else if (original[0] === original[0].toUpperCase()) {
        return modified.charAt(0).toUpperCase() + modified.slice(1).toLowerCase();
    } else {
        return modified.toLowerCase();
    }
}

const algorithms = {
    letterPosition: {
      Mild: [findWordWithDuplicatedLettersRemoved, findValidPermutation, swapAdjacentLettersSometimes],
      Severe: [findWordWithDuplicatedLettersRemoved, findValidPermutation, scrambleMiddleLetters],
    },
    neglectDyslexia: {
      Mild: [simulateNeglectDyslexia],
      Severe: [simulateFrquencyNeglectDyslexia],
    },
};

function findPermutation(word, algorithmName, intensity) {
    let originalWord = word.toLowerCase();
    let modifiedWord = originalWord;

    if (algorithms[algorithmName] && algorithms[algorithmName][intensity]) {
        for (const transformation of algorithms[algorithmName][intensity]) {
            const transformedWord = transformation(modifiedWord);
            if (transformedWord !== originalWord) {
                modifiedWord = transformedWord;
                break; 
            }
        }
    }
    if (!originalWordLookup.has(modifiedWord.toLowerCase())) {
        originalWordLookup.set(modifiedWord.toLowerCase(), originalWord);
    }

    return applyOriginalCase(word, modifiedWord);
}

function activateTTSForWord(scrambledWord) {
    const originalWord = originalWordLookup.get(scrambledWord.toLowerCase()) || scrambledWord;
    return originalWord;
}

function scrambleText(text, algorithm, intensity) {
    return text.split(/\b/).map(word => {
        if (/^\w+$/.test(word)) {
            let scrambledWord = findPermutation(word, algorithm, intensity);
            /*
            if (scrambledWord !== word) {
                console.log('Word: ',word,' Scrambling word:', scrambledWord);
            }
            */
            return scrambledWord;
        } else {
            return word;
        }
    }).join('');
}

let originalTexts = new Map(); 

function processElement(element, action, algorithm, intensity) {
    if (element.nodeType === 3 && element.nodeValue.trim().length > 0) {
        const originalText = originalTexts.get(element);
        
        if (action === 'scramble') {
            if (!originalText) {
                originalTexts.set(element, element.nodeValue);
            }
            element.nodeValue = scrambleText(element.nodeValue, algorithm, intensity);
        } else if (action === 'restore' && originalText) {
            element.nodeValue = originalText;
            originalWordLookup = new Map();
        }
    } else if (element.nodeType === 1) { 
        if (!['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(element.tagName)) {
            Array.from(element.childNodes).forEach(child => processElement(child, action, algorithm, intensity));
        }
    }
}

function updateText(action, algorithm, intensity) {
    const selectors = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th',
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            processElement(element, action, algorithm, intensity);
        });
    });    
}

function initializeContentScript() {
    chrome.runtime.sendMessage({ action: 'getWordData' }, (response) => {
        if (response) {
            wordsDict = response.wordsDict;
            pattern_dict = response.pattern_dict;
            neglectDict = response.neglectDict;
        } else {
            console.error('Failed to receive word data and pattern dictionary from background script');
        }
    });
}

initializeContentScript();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scramble' || request.action === 'restore') {
      updateText(request.action, request.algorithm, request.intensity);
    }
});