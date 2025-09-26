import os
import re
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

def validate_youtube_url(url: str) -> bool:
    """Checks if a YouTube video URL is valid using the oEmbed API."""
    # This endpoint is a reliable way to check if a video is publicly accessible.
    oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
    try:
        # Set a short timeout to avoid long waits for invalid URLs
        response = requests.get(oembed_url, timeout=5)
        # A 200 OK status means the video metadata was found.
        return response.status_code == 200
    except requests.RequestException:
        # If the request fails (e.g., timeout, network error), it's not a valid/accessible link.
        return False

# --- GROQ API CALL ---
def get_groq_response(query: str, system_prompt: str) -> str:

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