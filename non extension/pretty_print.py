import json
import sys
import os

def clean_and_format_json(input_text):
    # Remove the security prefix if present
    if input_text.startswith(")]}'"):
        input_text = input_text[4:]
    
    try:
        # Parse the JSON
        data = json.loads(input_text)
        
        # Pretty print with proper indentation
        formatted_json = json.dumps(data, indent=2, ensure_ascii=False)
        return formatted_json
    except json.JSONDecodeError as e:
        return f"Error parsing JSON: {str(e)}"

def main():
    # Read from file if provided as argument, otherwise from stdin
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        with open(input_file, 'r', encoding='utf-8') as file:
            input_text = file.read()
        
        # Create output filename by adding 'formatted_' prefix
        filename = os.path.basename(input_file)
        output_file = f"formatted_{filename}"
    else:
        input_text = sys.stdin.read()
        output_file = "formatted_output.json"
    
    formatted_json = clean_and_format_json(input_text)
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(formatted_json)
    print(f"Formatted JSON has been saved to: {output_file}")

if __name__ == "__main__":
    main()