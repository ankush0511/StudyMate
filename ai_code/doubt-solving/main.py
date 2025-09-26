import sys
import json
import re
import base64
from groq import Groq
from dotenv import load_dotenv
from fpdf import FPDF
from notes_videos import clean_text_for_pdf, generate_pdf_from_json, get_groq_response, validate_youtube_url

load_dotenv()

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
            # 1. Change the prompt to request structured JSON
            system_prompt = (
                "You are a YouTube video finder. Based on the user's topic, find 3 to 5 highly relevant "
                "YouTube videos. Your response MUST be a valid JSON array of objects. Each object must have "
                "a 'title', 'channel', and 'url' key. Ensure the URL is a direct link to a YouTube video."
            )
            ai_response_str = get_groq_response(user_query, system_prompt)
            
            # 2. Clean and parse the JSON response
            cleaned_str = re.sub(r'^```json\s*|\s*```$', '', ai_response_str.strip())
            videos_json = json.loads(cleaned_str)
            
            # 3. Validate each URL and build a clean response string
            validated_videos = []
            if isinstance(videos_json, list): # Make sure the AI returned a list
                for video in videos_json:
                    url = video.get("url")
                    if url and validate_youtube_url(url):
                        validated_videos.append(video)
            
            # 4. Format the final string to send to the frontend
            if not validated_videos:
                response_content = "I couldn't find any valid YouTube videos for that topic. Please try a different search."
            else:
                response_parts = []
                for idx, video in enumerate(validated_videos):
                    title = video.get('title', 'No Title')
                    channel = video.get('channel', 'No Channel')
                    url = video.get('url')
                    response_parts.append(
                        f"**{idx + 1}. {title}**\n"
                        f"- **Channel:** {channel}\n"
                        f"- **Link:** {url}"
                    )
                response_content = "\n\n".join(response_parts)

            result_dict = {"response": response_content, "isPdf": False}

        else:
            raise ValueError(f"Unknown task: {task}")
        
    except Exception as e:
        result_dict = {"error": f"An error occurred in the Python backend: {str(e)}"}
    
    print(json.dumps(result_dict))