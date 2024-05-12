import csv
import itertools

def load_common_words(file_path, limit=70000):
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        words_frequencies = [(row['word'], int(row['count'])) for row in reader][:limit]
    return words_frequencies


def find_efficient_permutations(words_frequencies):
    # Convert list to a dictionary for faster frequency lookup
    freq_dict = {word: freq for word, freq in words_frequencies}
    words = [word for word, freq in words_frequencies]

    # Similar logic as before but keep track of frequencies
    pattern_dict = {}
    for word in words:
        if len(word) > 3:
            key = word[0] + ''.join(sorted(word[1:-1])) + word[-1]
            pattern_dict.setdefault(key, []).append(word)

    # Prepare the list of sorted permutations
    sorted_permutations = []
    for key, word_list in pattern_dict.items():
        if len(word_list) > 1:
            # Sort words by frequency (descending order)
            word_list.sort(key=lambda word: freq_dict[word], reverse=True)
            sorted_permutations.append(tuple(word_list))

    return sorted_permutations


# Remember to update the main function to use find_efficient_permutations_and_doubled instead of find_efficient_permutations
def main():
    file_path = 'unigram_freq.csv'  # Adjust the path to your CSV file
    output_path = 'sorted_permutations.csv'  # Define the output file path for doubled letters removal results
    common_words_frequencies = load_common_words(file_path)
    frequent_words = find_efficient_permutations(common_words_frequencies)

    # Write the doubled letters removal results to a CSV file
    with open(output_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Original Word', 'After Doubled Letter Removal'])  # Header
        for word_pair in frequent_words:
            writer.writerow(word_pair)

    print(f"Words with doubled letter removals have been saved to {output_path}")

if __name__ == "__main__":
    main()
