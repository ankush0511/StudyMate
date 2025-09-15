import sys
import json
from chat import agent
from graph import app_graph

def run_model(query):

    
    """
    This runs your actual AI model execution using the agent.
    """
    career_keywords = ["career", "job", "profession", "future job", "study path", "college", "university", "admission", "course", "degree", "field of study", "work", "occupation"]

    is_career_query = any(keyword in query for keyword in career_keywords)

    if is_career_query:
        suggestion_message = (
            "It looks like you're asking about careers! For more detailed and personalized career guidance, "
            "please switch to the 'Career Guidance' AI task using the dropdown above. "
            "I can help you explore career paths, market trends, and learning roadmaps there!"
            )
        return suggestion_message
    

    if query:
        return agent(query) 
    else:
        return "No query provided."

def main():
    try:
        input_data = json.loads(sys.stdin.read()) 
        query = input_data.get("query", "")

        result = run_model(query)
        print(json.dumps({"output": result})) 
    except Exception as e:
        print(json.dumps({"error": str(e)}))   

if __name__ == "__main__":
    main()