import csv
import itertools

def load_common_words(file_path, limit=70000):
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        words_frequencies = {row['word']: int(row['count']) for row in reader}
    return dict(itertools.islice(words_frequencies.items(), limit))

def simulateLeftNeglectDyslexiaForAllWords(filePath, outputFilePath):
    wordsDict = load_common_words(filePath)
    resultsDict = {}

    for word, count in wordsDict.items():
        if len(word) < 3:
            continue  
        
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
                
        if possibleWords:  
            resultsDict[word] = list(possibleWords)

    # Saving results to a CSV file
    with open(outputFilePath, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Original Word', 'Possible Dyslexic Variants'])
        for word, variants in resultsDict.items():
            writer.writerow([word, ', '.join(variants)])

if __name__ == "__main__":
    filePath = "C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/unigram_freq.csv"
    outputFilePath = "C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/output.csv"
    simulateLeftNeglectDyslexiaForAllWords(filePath, outputFilePath)
