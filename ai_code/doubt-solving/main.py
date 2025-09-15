import os
import sys
import json
from groq import Groq
from dotenv import load_dotenv

# --- CONFIGURATION ---
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"

def get_copilot_response(query: str) -> str:
    """
    Gets a response from the Groq API for a given query.
    """
    load_dotenv()
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in the environment. Please create a .env file.")

    client = Groq(api_key=api_key)

    system_prompt = (
        "You are Groq Co-Pilot, a helpful and knowledgeable AI assistant. "
        "Your goal is to provide accurate, concise, and well-formatted answers to the user's query. "
        "Use Markdown for formatting, such as bolding and bullet points, when it enhances clarity."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]

    chat_completion = client.chat.completions.create(
        messages=messages,
        model=MODEL_NAME,
        temperature=0.7,
        max_tokens=2048,
    )

    return chat_completion.choices[0].message.content

# --- MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        
        user_query = request.get("query")
        if not user_query:
            raise ValueError("The 'query' field is missing from the input.")

        final_output = get_copilot_response(user_query)
        
        # --- THIS IS THE FIX ---
        # The output key is now "response" to match what route.js expects.
        result_dict = {"response": final_output}
        
        print(json.dumps(result_dict))

    except Exception as e:
        error_dict = {"error": f"An error occurred in the Python backend: {str(e)}"}
        print(json.dumps(error_dict))