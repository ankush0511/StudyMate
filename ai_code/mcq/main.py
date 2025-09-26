# ai_code/mcq/main.py
import sys
import json
from mcq import generate_mcqs
from text_extractor import get_text_from_file # Import our new helper
import logging

# Suppress noisy library logs if needed
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('mcq').setLevel(logging.WARNING)

def run_model(source_text, num_questions):
    """
    Calls the core MCQ generation logic.
    Assumes generate_mcqs is designed to take a block of text as its primary input.
    """
    return generate_mcqs(source_text, num_questions)

def main():
    try:
        input_data = json.loads(sys.stdin.read()) 
        query_data = input_data.get("query", {})
        
        num_questions = query_data.get("num_questions", 5)
        input_type = query_data.get("input_type", "topic") # Default to 'topic' if not provided
        source_text = ""
        
        # Determine the source of the text for the quiz based on input_type
        if input_type == 'topic':
            source_text = query_data.get("topic", "").strip()
            if not source_text:
                raise ValueError("Input Error: Topic cannot be empty.")
                
        elif input_type == 'paragraph':
            source_text = query_data.get("paragraph", "").strip()
            if not source_text:
                raise ValueError("Input Error: Paragraph cannot be empty.")
                
        elif input_type == 'file':
            file_path = query_data.get("filePath")
            if not file_path:
                raise ValueError("Input Error: File path was not provided to the script.")
            source_text = get_text_from_file(file_path)
            if source_text is None or not source_text.strip():
                raise ValueError(f"Input Error: Could not extract any text from the file provided.")
        
        else:
            raise ValueError(f"Input Error: Unsupported input type '{input_type}'.")

        # Generate the MCQs using the determined source text
        result = run_model(source_text, num_questions) 

        # Ensure the final output is a valid JSON structure
        print(json.dumps({"response": {"mcqs": result}}))
        
    except Exception as e:
        # Print errors as a JSON object so the Node.js server can parse and forward them
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()