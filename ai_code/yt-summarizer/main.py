from youtube_utils import extract_video_id, get_transcript_and_summary
from pinecone_utils import create_pinecone_index, index_documents, retrieve_documents
from llm_utils import generate_answer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import json
import sys

pinecone_index = create_pinecone_index()


def process_youtube_video(youtube_url: str) -> dict:

    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")

    transcript, summary = get_transcript_and_summary(video_id)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=7000, chunk_overlap=50)
    documents = text_splitter.create_documents([summary])
    index_documents(documents, pinecone_index)

    return {
        "video_id": video_id,
        "transcript": transcript,
        "summary": summary
    }


def answer_query(query: str) -> str:
    """
    Answer a user question using RAG over the indexed summary.
    """
    if not query:
        raise ValueError("Query is empty")

    retrieved_docs = retrieve_documents(query, pinecone_index)
    return generate_answer(query, retrieved_docs)


# Example usage for testing or backend call:
if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read()) 

        url = input_data.get("query", "")

        result = process_youtube_video(url)

        print(json.dumps({"response": {"Summary": result}}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
