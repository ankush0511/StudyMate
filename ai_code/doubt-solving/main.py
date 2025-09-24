import os
import sys
import json
import re
import base64
import requests
from groq import Groq
from dotenv import load_dotenv
from fpdf import FPDF

# --- CONFIGURATION ---
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"


def clean_text_for_pdf(text):
    """Replaces common unsupported Unicode characters with latin-1 equivalents."""
    replacements = {
        '\u2013': '-', '\u2014': '-', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...', '•': '*',
    }
    for unicode_char, replacement in replacements.items():
        text = text.replace(unicode_char, replacement)
    return text.encode('latin-1', 'ignore').decode('latin-1')

def generate_pdf_from_json(json_data):
    """Generates a PDF from a JSON array of notes and returns it as bytes."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    for item in json_data:
        topic = clean_text_for_pdf(item.get('topic', '').capitalize())
        explanation = clean_text_for_pdf(item.get('explanation', ''))
        pdf.set_font("Arial", 'B', 14)
        pdf.multi_cell(0, 10, topic)
        pdf.ln(2)
        pdf.set_font("Arial", '', 12)
        parts = re.split(r'(\*\*.*?\*\*)', explanation)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                pdf.set_font('', 'B')
                pdf.write(5, part.strip('*'))
            else:
                pdf.set_font('', '')
                pdf.write(5, part)
        pdf.ln(10)
    return pdf.output(dest="S").encode("latin-1")


# --- GROQ API CALL ---
def get_groq_response(query: str, system_prompt: str) -> str:
    """Gets a response from the Groq API with a specific system prompt."""
    load_dotenv()
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found. Please create a .env file.")

    client = Groq(api_key=api_key)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]

    chat_completion = client.chat.completions.create(
        messages=messages,
        model=MODEL_NAME,
        temperature=0.7,
        max_tokens=4096,
        # --- THIS IS THE FIX ---
        # Stop waiting for the API after 30 seconds
        timeout=30.0,
    )
    return chat_completion.choices[0].message.content

# --- MAIN EXECUTION BLOCK ---
# ... (The rest of your main execution block is correct)
if __name__ == "__main__":
    result_dict = {}
    try:
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        task = request.get("aiTask")
        user_query = request.get("query")
        if not task or not user_query:
            raise ValueError("Both 'aiTask' and 'query' fields are required.")

        if task == "doubt-solving":
            system_prompt = (
                "You are a helpful AI assistant. Your goal is to provide accurate and concise "
                "answers. Use Markdown for formatting, such as bolding and bullet points."
            )
            response_content = get_groq_response(user_query, system_prompt)
            result_dict = {"response": response_content, "isPdf": False}

        elif task == "generate-notes":
            system_prompt = (
                "You are a note-taking assistant. Based on the user's topic, generate detailed notes. "
                "Your response MUST be a valid JSON array of objects. Each object must have a 'topic' key "
                "and an 'explanation' key. Use markdown bolding with ** for important terms within the explanation."
            )
            ai_response_str = get_groq_response(user_query, system_prompt)
            cleaned_str = re.sub(r'^```json\s*|\s*```$', '', ai_response_str.strip())
            notes_json = json.loads(cleaned_str)
            pdf_bytes = generate_pdf_from_json(notes_json)
            pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
            display_text = ""
            for item in notes_json:
                display_text += f"**{item.get('topic', '')}**\n{item.get('explanation', '')}\n\n"
            file_name = f"Notes_on_{user_query.replace(' ', '_')}.pdf"
            result_dict = {
                "isPdf": True,
                "displayText": display_text.strip(),
                "pdfData": pdf_b64,
                "fileName": file_name
            }

        elif task == "find-youtube-videos":
            system_prompt = (
                "You are a YouTube video finder. Based on the user's topic, find 3 to 5 highly relevant "
                "YouTube videos. For each video, provide the title, the channel name, and a direct URL. "
                "Format your response clearly using Markdown."
            )
            response_content = get_groq_response(user_query, system_prompt)
            result_dict = {"response": response_content, "isPdf": False}

        else:
            raise ValueError(f"Unknown task: {task}")
        
    except Exception as e:
        result_dict = {"error": f"An error occurred in the Python backend: {str(e)}"}
    
    print(json.dumps(result_dict))