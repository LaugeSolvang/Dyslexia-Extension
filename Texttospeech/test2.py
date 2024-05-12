import csv
import itertools

def load_common_words(file_path, limit=70000):
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        # Just load the words, ignoring frequencies
        words = [row['word'] for row in reader][:limit]
    return words


def find_efficient_permutations(words):
    # Use a simpler approach without considering frequencies
    pattern_dict = {}
    for word in words:
        if len(word) > 3:
            key = word[0] + ''.join(sorted(word[1:-1])) + word[-1]
            pattern_dict.setdefault(key, []).append(word)

    # Prepare the list of permutations without sorting by frequency
    sorted_permutations = []
    for key, word_list in pattern_dict.items():
        if len(word_list) > 1:
            sorted_permutations.append(tuple(word_list))

    return sorted_permutations


# Combine results from efficient permutations and doubled letters removal without considering frequencies
def find_efficient_permutations_and_doubled(words):
    permuted_words = find_efficient_permutations(words)
    doubled_letter_words = find_words_with_duplicated_letters_removed(words)
    
    # Combine the lists, ensuring no duplicates
    combined_results = permuted_words + list(set(doubled_letter_words) - set(permuted_words))
    
    return combined_results

def main():
    file_path = 'unigram_freq.csv'  # Adjust the path to your CSV file
    output_path = 'doubled.csv'  # Define the output file path for doubled letters removal results
    common_words = load_common_words(file_path)
    doubled_letter_words = find_words_with_duplicated_letters_removed(common_words)

    # Write the doubled letters removal results to a CSV file
    with open(output_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Original Word', 'After Doubled Letter Removal'])  # Header
        for modified_word, original_word in doubled_letter_words:
            writer.writerow([original_word, modified_word])  # Swapped order

    print(f"Words with doubled letter removals have been saved to {output_path}")

if __name__ == "__main__":
    main()
