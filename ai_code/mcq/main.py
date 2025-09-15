# ai_code/main.py
import sys
import json
from mcq import generate_mcqs
import logging

logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('mcq').setLevel(logging.WARNING)



def run_model(topic, num_questions):

    return generate_mcqs(topic, num_questions)

def main():
    try:
        input_data = json.loads(sys.stdin.read()) 

        query_data = input_data.get("query", {})
        topic = query_data.get("topic", "")
        num_questions = query_data.get("num_questions") 
        result = run_model(topic, num_questions) 

        print(json.dumps({"response": {"mcqs": result}}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()