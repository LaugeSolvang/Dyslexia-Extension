let wordsDict = {};
let pattern_dict = {};
let neglectDict = {};
let originalWordLookup = {};

function getPatternKey(word) {
    return word[0] + word.slice(1, -1).split('').sort().join('') + word[word.length - 1];
}

function findWordWithDuplicatedLettersRemoved(word) {
    let letterPositions = {};
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        if (letterPositions[letter]) {
            letterPositions[letter].push(i);
        } else {
            letterPositions[letter] = [i];
        }
    }

    for (const [letter, positions] of Object.entries(letterPositions)) {
        if (positions.length > 1) {
            for (const pos of positions) {
                if (pos !== 0 && pos !== word.length - 1) {
                    const newWord = word.substring(0, pos) + word.substring(pos + 1);
                    if (newWord.length > 3 && wordsDict[newWord]) {
                        return newWord; 
                    }
                    break; 
                }
            }
        }
    }
    return word; 
}

function findValidPermutation(word) {
    const key = getPatternKey(word);

    if (pattern_dict[key]) {
        const permutations = pattern_dict[key];
        for (const permutation of permutations) {
            if (permutation !== word && wordsDict[permutation]) {
                return permutation;
            }
        }
    }
    return word;
}

function scrambleMiddleLetters(word) {
    if (word.length > 5) {
        const first = word[0];
        const last = word[word.length - 1];
        let middle = word.substring(1, word.length - 1).split('');

        for (let i = middle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [middle[i], middle[j]] = [middle[j], middle[i]];
        }
        return first + middle.join('') + last;
    }
    return word;
}

function simulateNeglectDyslexia(word) {
    if (word.length < 3 || !neglectDict[word]) {
        return word; 
    }

    const possibleWords = neglectDict[word];

    if (possibleWords.length === 0) {
        return word; 
    } else {
        const randomIndex = Math.floor(Math.random() * possibleWords.length);
        return possibleWords[randomIndex];
    }
}

function simulateFrquencyNeglectDyslexia(word) {
    if (word.length < 3 || !neglectDict[word]) {
        return word; 
    }

    const possibleWords = neglectDict[word];


    if (possibleWords.length === 0) {
        return word;
    } else {
        // Calculate total weight (sum of frequencies)
        const totalWeight = possibleWords.reduce((total, word) => total + (wordsDict[word] || 1), 0);

        // Generate a random value between 0 and total weight
        let randomValue = Math.random() * totalWeight;
        let selectedWord = word;

        for (let i = 0; i < possibleWords.length; i++) {
            const wordWeight = wordsDict[possibleWords[i]] || 1;
            if (randomValue < wordWeight) {
                selectedWord = possibleWords[i];
                break;
            }
            randomValue -= wordWeight;
        }

        return selectedWord;
    }
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
    letterIdentity: {
      Mild: [findWordWithDuplicatedLettersRemoved, findValidPermutation],
      Severe: [findWordWithDuplicatedLettersRemoved, findValidPermutation, scrambleMiddleLetters],
    },
    neglectDyslexia: {
      Mild: [simulateFrquencyNeglectDyslexia],
      Severe: [simulateNeglectDyslexia],
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
                break; // Ensure we exit the loop after the first change
            }
        }
    }

    originalWordLookup[modifiedWord.toLowerCase()] = originalWord;

    return applyOriginalCase(word, modifiedWord);
}

function activateTTSForWord(scrambledWord) {
    const originalWord = originalWordLookup[scrambledWord.toLowerCase()] || scrambledWord;
    return originalWord
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
            originalWordLookup = {};
        }
    } else if (element.nodeType === 1) { 
        if (!['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(element.tagName)) {
            Array.from(element.childNodes).forEach(child => processElement(child, action, algorithm, intensity));
        }
    }
}

function updateText(action, algorithm, intensity) {
    const selectors = [
        'p',  
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'li', //'a', 
        'td', 'th',
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
      console.log(`Received request to ${request.action} text with algorithm: ${request.algorithm} and intensity: ${request.intensity}`);
      updateText(request.action, request.algorithm, request.intensity);
    }
});