def find_words_with_duplicated_letters_removed(words):
    # Use a set for words for faster lookups, ignoring frequencies
    words_set = set(words)

    modified_words = []
    print("Starting to find words with duplicated letters removed...")

    for word in words_set:
        # Track if any modifications are made
        modified = False
        # Check each letter in the word, except the first and last
        for i in range(1, len(word) - 1):
            # Count how many times the letter appears in the word
            if word.count(word[i]) > 1:
                # Remove one instance of this letter
                new_word = word[:i] + word[i+1:]
                if new_word in words_set:
                    modified = True
                    modified_words.append((word, new_word))
                    print(f"Modified '{word}' to '{new_word}' by removing one '{word[i]}'")
                    break  # Stop after first modification for simplicity

        if not modified:
            print(f"No duplicated removed in '{word}'")

    print("Finished processing.")
    return modified_words

words = ["driver", "diver", "baby", "bay", "apple", "appeal", "letter", "better"]
doubled_letter_words = find_words_with_duplicated_letters_removed(words)
for original, removed in doubled_letter_words:
    print(f"Original: {original}, After Removing Doubled Letters: {removed}")
