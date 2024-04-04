import csv
import json

# Adjust the file paths as necessary
input_csv = 'unigram_freq.csv'
output_json = 'words_frequency_reduced.json'

data = []
limit = 70000  # Set limit to the first 70,000 words
try:
    with open(input_csv, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for i, row in enumerate(csv_reader):
            if i < limit:  # Check if the current index is below the limit
                data.append(row)
            else:
                break  # Stop reading the file once the limit is reached
except Exception as e:
    print(f"Error reading CSV file: {e}")

try:
    with open(output_json, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file)
except Exception as e:
    print(f"Error writing JSON file: {e}")
