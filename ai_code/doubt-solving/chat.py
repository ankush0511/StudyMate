from langchain_groq import ChatGroq

def agent(query):
    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key="")
    res = llm.invoke(query).content
    return res

# print(agent("tell me about SDE role"))