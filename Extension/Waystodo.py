import json

def loadWordsDict(filePath):
    try:
        with open(filePath, 'r') as file:
            data = json.load(file)
            return {item['word'] for item in data}  # Extracting words to form a set
    except Exception as e:
        print(f"An error occurred while loading the dictionary: {e}")
        return set()

def simulateLeftNeglectDyslexia(word, filePath):
    wordsDict = loadWordsDict(filePath)
    
    if len(word) < 3 or not wordsDict:
        return [word]  # Return the original word in a list if it's too short or wordsDict is not loaded

    possibleWords = set()  # Use a set to avoid duplicates
    half_length = len(word) // 2

    # Addition, substitution, and omission operations limited to the first 50% of the word
    for i in range(half_length + 1):
        for charCode in range(97, 123):
            char = chr(charCode)
            # Addition
            modifiedWord = word[:i] + char + word[i:]
            if modifiedWord in wordsDict:
                possibleWords.add(modifiedWord)
            # Substitution
            if i < half_length:  # Ensure substitution occurs only within the first half
                modifiedWord = word[:i] + char + word[i + 1:]
                if modifiedWord in wordsDict:
                    possibleWords.add(modifiedWord)
    # Omission
    for i in range(half_length):
        modifiedWord = word[:i] + word[i + 1:]
        if modifiedWord in wordsDict:
            possibleWords.add(modifiedWord)

    return list(possibleWords)

# Example usage:
filePath = 'C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/dictionary.json'
word = "extreme"
results = simulateLeftNeglectDyslexia(word, filePath)
print(results)
