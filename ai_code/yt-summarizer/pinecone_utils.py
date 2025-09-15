from pinecone import Pinecone, ServerlessSpec
from typing import List, Any 
import uuid
from llm_utils import get_embedding
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Pinecone configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "rag"
DIMENSION = 1536
METRIC = "cosine"


def create_pinecone_index():
    """Create or connect to a Pinecone index."""
    pinecone = Pinecone(api_key=PINECONE_API_KEY)
    if INDEX_NAME not in pinecone.list_indexes().names():
        pinecone.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric=METRIC,
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    return pinecone.Index(INDEX_NAME)

# CORRECTED: Changed type hint from List[str] to List[Any] to reflect actual usage.
# If using a specific library like LangChain, you could import its Document class
# and use List[Document] for better type safety.
def index_documents(documents: List[Any], index):
    """Embed and index documents in Pinecone."""
    vectors = []
    for doc in documents:
        # Assumes 'doc' is an object with a 'page_content' attribute
        embedding = get_embedding(doc.page_content)
        vector_id = str(uuid.uuid4())
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {"text": doc.page_content}
        })
    index.upsert(vectors=vectors)

def retrieve_documents(query: str, index, top_k: int = 1) -> List[tuple[str, float]]:
    """Retrieve relevant documents from Pinecone based on query."""
    query_embedding = get_embedding(query)
    query_response = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    # CORRECTED: Removed the trailing comma to fix the SyntaxError
    return [(match.metadata.get("text"), match.score) for match in query_response.matches]