import sys
import json
import os
import subprocess

try:
    from dotenv import load_dotenv
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
    from dotenv import load_dotenv

from career_guidance_system import CareerGuidanceSystem
from career_chatbot import CareerChatAssistant

load_dotenv()

def main():
    try:
        input_data = json.load(sys.stdin)
        ai_task = input_data.get("aiTask")
        query = input_data.get("query", {})
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            groq_api_key = groq_api_key.strip()

        serpapi_key = os.getenv("SERPAPI_KEY")
        if serpapi_key:
            serpapi_key = serpapi_key.strip()

        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables.")

        career_system = CareerGuidanceSystem(groq_api_key=groq_api_key, serpapi_key=serpapi_key)
        response_data = {}

        user_query = query.get("user_query")
        
        if user_query:
            career_data = query.get("career_data")
            chat_assistant = CareerChatAssistant(career_system=career_system)
            chat_response = chat_assistant.process_question(user_query, career_data)
            response_data = {"chat_response": chat_response}
        else:
            career_name = query.get("career_name")
            if not career_name:
                raise ValueError("career_name is required to generate a career guide.")
            
            analysis_result = career_system.comprehensive_career_analysis(career_name)
            response_data = analysis_result

        print(json.dumps({"response": response_data}))

    except Exception as e:
        error_response = {"error": f"An error occurred in the Python script: {str(e)}"}
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()