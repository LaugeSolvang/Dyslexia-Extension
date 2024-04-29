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

function swapAdjacentLettersSometimes(word) {
    if (word.length > 3 && Math.random() < 0.3) {  // 30% chance to swap
        let index = Math.floor(Math.random() * (word.length - 2)) + 1;
        const chars = word.split('');
        [chars[index], chars[index + 1]] = [chars[index + 1], chars[index]]; // Swap adjacent letters
        return chars.join('');
    }
    return word;
}

function scrambleMiddleLetters(word) {
    if (word.length > 5) {
        const first = word[0];
        const last = word[word.length - 1];
        let middle = word.substring(1, word.length - 1).split('');

        for (let i = middle.length - 1; i > 0; i--) {
            if (Math.random() < 0.5) {  // Only swap 50% of the time
                const j = Math.floor(Math.random() * (i + 1));
                [middle[i], middle[j]] = [middle[j], middle[i]];
            }
        }
        return first + middle.join('') + last;
    }
    return word;
}

function simulateNeglectDyslexia(word) {
    // Check if the word is too short or not in the neglectDict
    if (word.length < 3 || !neglectDict[word]) {
        return word; 
    }

    if (Math.random() > 0.3) {
        return word;
    }

    const possibleWords = neglectDict[word];

    if (possibleWords.length === 0) {
        return word;
    } else {
        const totalWeight = possibleWords.reduce((total, word) => total + (wordsDict[word] || 1), 0);

        const originalWordWeight = wordsDict[word] || 1;

        // If the total weight of alternatives is less than 10% of the original word's weight, return the original word
        if (totalWeight < 0.1 * originalWordWeight) {
            return word;
        }

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