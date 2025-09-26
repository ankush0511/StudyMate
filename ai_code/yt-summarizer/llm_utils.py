from openai import OpenAI
from typing import List, Tuple
import time
import os
from dotenv import load_dotenv
# Load environment variables
load_dotenv()

# API configuration
A4F_API_KEY = "ddc-a4f-6816dbcca1a1426180a107549f8e7418"
A4F_API_URL = "https://api.a4f.co/v1"
openai_client = OpenAI(api_key=A4F_API_KEY, base_url=A4F_API_URL)

def get_embedding(text: str) -> List[float]:
    """Generate embedding for a given text using OpenAI."""
    time.sleep(10)
    response = openai_client.embeddings.create(
        input=text,
        model="provider-6/qwen3-embedding-4b"
    )
    return response.data[0].embedding

def generate_answer(query: str, retrieved_docs: List[Tuple[str, float]]) -> str:
    """Generate answer using OpenAI GPT model with retrieved documents."""
    context = "\n".join([doc[0] for doc in retrieved_docs])
    prompt = f"""Context:\n{context}\n\nQuery: {query}\n\nAnswer the query based on the provided context."""

    response = openai_client.chat.completions.create(
        model="provider-3/gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return response.choices[0].message.content.strip()