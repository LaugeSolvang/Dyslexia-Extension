def load_word_pairs(file_paths):
    words_set = set()
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                words = line.strip().split(',')
                if len(words) > 1:  # Ensure there is at least two words in the line
                    words_set.add(words[1])  # Only add the second word
    return words_set

def count_matching_words(article_text, words_set):
    # Normalize the article text to lowercase and split into words
    article_words = article_text.lower().split()
    # Find matching words
    matching_words = [word for word in article_words if word in words_set]
    return matching_words

# Assume the text file with word pairs is named 'word_pairs.txt'
file_paths = ['doubled.csv', 'sorted_permutations.csv']  # Add the correct paths to your files here


# Load the word pairs from the file
words_set = load_word_pairs(file_paths)

# The article text is already provided in the previous interaction
article_text = """
Simulating different types of dyslexia in a Chrome extension can help web developers and designers understand how dyslexic users might experience their webpages. This could lead to more accessible web designs. Here's how you might simulate each type of dyslexia mentioned:

1. Surface Dyslexia Simulation
Objective: Mimic difficulty in recognizing words by sight, leading to incorrect reading of irregularly spelled words.
Implementation: Randomly replace words with irregular spelling on the webpage with phonetically similar but incorrectly spelled versions. For example, "enough" could be replaced with "enuf".
2. Visual Dyslexia Simulation
Objective: Reflect the challenges in distinguishing similar-looking letters or words.
Implementation: Apply CSS styles to slightly blur text or alter letters that commonly get confused with each other, like b and d, or p and q. You could also simulate letter crowding by reducing the spacing between letters.
3. Phonological Dyslexia Simulation
Objective: Demonstrate difficulty in decoding words by sounding them out, especially non-words.
Implementation: Insert non-words (nonsense words) into text to simulate the challenge of phonological decoding. Highlight these non-words to show users where they would typically struggle.
4. Deep Dyslexia Simulation
Objective: Show semantic errors and difficulty in reading non-words.
Implementation: Replace words with semantically related words (e.g., "cat" with "dog") and insert non-words into text. This could be complemented by a feature that, when a non-word is clicked, indicates it is a non-word to simulate the recognition failure.
5. Semantic Dyslexia Simulation
Objective: Illustrate difficulties with accessing the meanings of words.
Implementation: Replace concrete nouns with abstract ones or vice versa to make the text harder to understand. Alternatively, blur or obscure keywords in a sentence to simulate the challenge of grasping the meaning.
Technical Implementation
For a Chrome extension, you would use a combination of JavaScript for logic operations (like identifying words to replace or alter) and CSS for visual modifications (like blurring text or adjusting letter spacing). Here's a high-level approach:

Content Script: Write a content script that runs on webpage content. This script can analyze and modify the webpage's text according to the dyslexia type being simulated.
CSS Injection: Use CSS to achieve visual effects like blurring or letter spacing adjustments. You can dynamically inject CSS rules with JavaScript.
User Interface: Provide a popup or options page that allows users to select the type of dyslexia they want to simulate. Based on the selection, the extension would apply the corresponding modifications to the webpage.
Ethical Considerations
It's crucial to approach this project with sensitivity and aim for educational value. Make sure to communicate clearly that the simulation is an approximation and might not fully capture the individual experiences of people with dyslexia. Including resources for learning more about dyslexia and how to support accessible web design could enhance the educational impact of your extension.


"""

# Count the matching words
matching_word_count = count_matching_words(article_text, words_set)

print(f"Number of matching words in the article: {matching_word_count}")
