import json

def loadWordsDict(filePath):
    try:
        with open(filePath, 'r') as file:
            data = json.load(file)
            return {item['word'] for item in data}  # Extracting words to form a set
    except Exception as e:
        print(f"An error occurred while loading the dictionary: {e}")
        return set()

def simulateLeftNeglectDyslexiaForAllWords(filePath, outputFilePath):
    wordsDict = loadWordsDict(filePath)
    resultsDict = {}

    for word in wordsDict:
        if len(word) < 3:
            continue  # Skip words that are too short for modification
        
        possibleWords = set()
        half_length = len(word) // 2
        
        for i in range(half_length + 1):
            for charCode in range(97, 123):
                char = chr(charCode)
                # Addition
                modifiedWord = word[:i] + char + word[i:]
                if modifiedWord in wordsDict and modifiedWord != word:
                    possibleWords.add(modifiedWord)
                # Substitution
                if i < half_length:
                    modifiedWord = word[:i] + char + word[i + 1:]
                    if modifiedWord in wordsDict and modifiedWord != word:
                        possibleWords.add(modifiedWord)
        # Omission
        for i in range(half_length):
            modifiedWord = word[:i] + word[i + 1:]
            if modifiedWord in wordsDict and modifiedWord != word:
                possibleWords.add(modifiedWord)
                
        if possibleWords:  # Only add to results if there are any modified words
            resultsDict[word] = list(possibleWords)

    # Write the results to a file
    try:
        with open(outputFilePath, 'w') as outFile:
            json.dump(resultsDict, outFile, indent=4)  # Add indentation for better readability
        print(f"Results successfully written to {outputFilePath}")
    except Exception as e:
        print(f"An error occurred while writing the results: {e}")

# Example usage
filePath = 'C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/dictionary.json'
outputFilePath = 'C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/output2.json'
simulateLeftNeglectDyslexiaForAllWords(filePath, outputFilePath)
