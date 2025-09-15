import sys
import json
import base64
from utils.generate_material import generate_study_materials
from dotenv import load_dotenv
import os
load_dotenv()

groq_api_key=os.getenv('GROQ_API_KEY')


def run_model(input_method, content, file_name=None):
    flashcards = []
    mind_map = {} 

    if input_method == "topic" or input_method == "plain_text":
        # Use the API key from the .env file for both methods
        con = generate_study_materials(content, groq_api_key=groq_api_key)

        # --- FIX: Check if the result is a dictionary before using it ---
        if isinstance(con, dict):
            flashcards = con.get('flashcards', [])
            mind_map = con.get('mind_map', {})
        else:
            # If 'con' is not a dictionary, it's likely an error object.
            # Print a helpful message to the server log.
            print(f"API call failed. Received error: {con}", file=sys.stderr)
            # flashcards and mind_map will remain empty lists/dicts
    
    # PDF logic is unchanged, but consider removing if not used.
    elif input_method == "pdf":
        decoded_content = base64.b64decode(content).decode('latin-1') 
        flashcards.append({"question": f"Summary of {file_name}?", "answer": f"Content from {file_name} (first 50 chars): {decoded_content[:50]}..."})
        mind_map = {"placeholder": "PDF content not visualized"}
    
    return {"mindMapImage": mind_map, "flashcards": flashcards}

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        
        query_data = input_data.get("query", {})
        
        input_method = query_data.get("inputMethod")
        
        content = ""
        file_name = None
        
        if input_method == "topic":
            content = query_data.get("topicName", "")
        elif input_method == "plain_text":
            content = query_data.get("plainTextContent", "")
        elif input_method == "pdf":
            content = query_data.get("fileContent", "") 
            file_name = query_data.get("fileName", "")
        
        if not content:
            raise ValueError("No content provided for generation.")

        result = run_model(input_method, content, file_name)
        
        print(json.dumps({"response": result}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()

# input_method = "topic"
# content = "Machine Learning"
# file_name = None

# result = run_model(input_method, content, file_name)

# print(result)