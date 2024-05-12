import json

def load_json(filename):
    """Load JSON data from a file."""
    with open(filename, 'r', encoding='utf-8') as file:
        return json.load(file)

def merge_dictionaries(dict1, dict2):
    """Merge two dictionaries based on the keys in both, using the value from dict2."""
    merged_dict = {word: dict2[word] for word in dict1 if word in dict2}
    return merged_dict

def save_json(data, filename):
    """Save data to a JSON file in sorted order."""
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# Load the data from the JSON files
words_dictionary = load_json('C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/words_dictionary.json')
words_frequency = load_json('C:/Users/lauge/OneDrive/Dokumenter/SDU/Bachelor/Extension/words_frequency.json')

# Convert words_frequency to a dictionary with the same structure as words_dictionary
words_frequency_dict = {item['word']: int(item['count']) for item in words_frequency}

# Merge the dictionaries
merged_dict = merge_dictionaries(words_dictionary, words_frequency_dict)

# Sort the merged dictionary by frequency in descending order and prepare for JSON output
sorted_merged_list = sorted(merged_dict.items(), key=lambda item: item[1], reverse=True)
sorted_merged_dict_for_json = [{'word': word, 'count': count} for word, count in sorted_merged_list]

# Optionally, save the sorted merged dictionary to a new file
save_json(sorted_merged_dict_for_json, 'merged_sorted_dictionary.json')

print('Merged and sorted dictionary created and saved as merged_sorted_dictionary.json')
