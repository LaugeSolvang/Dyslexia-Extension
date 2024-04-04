let wordsDict = {};
let pattern_dict = {};
let neglectDict = {};

async function loadWordData() {
    const url = chrome.runtime.getURL('dictionary.json'); 
    const neglectUrl = chrome.runtime.getURL('neglect.json'); 

    try {
        const response = await fetch(url);
        const wordsData = await response.json();

        wordsDict = {}; 

        wordsData.forEach(({word, count}) => {
            wordsDict[word] = true;
            wordsDict[word] = count;
        });

        const response2 = await fetch(neglectUrl);
        const neglectData = await response2.json(); 
        neglectDict = neglectData;
        return wordsDict, neglectDict;
    } catch (error) {
        console.error('Error loading or processing words_dictionary.json:', error);
    }
}

function generatePatternDict(wordsDict) {
    for (const word in wordsDict) {
        if (wordsDict.hasOwnProperty(word) && word.length > 3) {
            const key = getPatternKey(word);
            if (pattern_dict[key]) {
                pattern_dict[key].push(word);
            } else {
                pattern_dict[key] = [word];
            }
        }
    }
}

function getPatternKey(word) {
    return word[0] + word.slice(1, -1).split('').sort().join('') + word[word.length - 1];
}

async function init() {
    await loadWordData(); 
    console.log('Loaded words data:', wordsDict);
    generatePatternDict(wordsDict); 
}

init(); 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getWordData') {
        console.log('Received request for word data');
        sendResponse({ wordsDict, pattern_dict, neglectDict });
    }
    return true; 
});