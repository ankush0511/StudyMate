import time
import os
import numpy as np
from dotenv import load_dotenv
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from openai import OpenAI

# Gracefully handle optional import of langchain-openai
try:
    from langchain_openai import OpenAIEmbeddings
    LANGCHAIN_OPENAI_AVAILABLE = True
except ImportError:
    LANGCHAIN_OPENAI_AVAILABLE = False
    OpenAIEmbeddings = None

load_dotenv()

# --- FIX: Check for environment variables before setting them ---
# This prevents the "TypeError: str expected, not NoneType" error.
a4f_api_key = os.getenv("A4F_API_KEY")
a4f_base_url = os.getenv("A4F_BASE_URL")
client = None # Initialize client as None

# Only set environment variables and initialize the client if the keys exist.
if a4f_api_key and a4f_base_url:
    os.environ["OPENAI_API_KEY"] = a4f_api_key
    os.environ["OPENAI_API_BASE"] = a4f_base_url
    client = OpenAI(
        api_key=a4f_api_key,
        base_url=a4f_base_url,
    )
# --- END FIX ---


class CareerChatAssistant:
    def __init__(self, career_system=None):
        self.career_system = career_system
        self.groq_api_key = career_system.groq_api_key if career_system else None
        self.vector_store = None
        self.retrieval_chain = None
        self.chat_history = []

    def initialize_rag(self, career_data):
        """Initialize RAG with career analysis data."""
        # --- FIX: Add a check for the client and the langchain_openai library ---
        if not LANGCHAIN_OPENAI_AVAILABLE or not client:
            return False # Silently disable RAG if dependencies are missing

        if not self.groq_api_key or not career_data:
            return False

        try:
            embeddings = OpenAIEmbeddings(model="provider-3/text-embedding-ada-002")

            documents = [
                f"Career Overview: {career_data.get('research', '')}",
                f"Market Analysis: {career_data.get('market_analysis', '')}",
                f"Learning Roadmap: {career_data.get('learning_roadmap', '')}",
                f"Industry Insights: {career_data.get('industry_insights', '')}"
            ]

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = text_splitter.create_documents(documents)
            self.vector_store = FAISS.from_documents(chunks, embeddings)

            prompt_template = """
            You are a Career Chat Assistant. Use the following context to answer the question.
            Context: {context}
            Chat History: {chat_history}
            Question: {question}
            Provide a clear, structured response using markdown.
            Assistant Response:
            """

            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "chat_history", "question"]
            )

            llm = ChatGroq(model='gemma2-9b-it', groq_api_key=self.groq_api_key, temperature=0.2)
            self.retrieval_chain = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=self.vector_store.as_retriever(),
                combine_docs_chain_kwargs={"prompt": prompt}
            )
            return True
        except Exception as e:
            # If RAG initialization fails for any reason, return False
            return False

    def process_question(self, question, career_data=None):
        """Process a user question, attempting to use RAG first."""
        if not self.retrieval_chain:
            self.initialize_rag(career_data)

        if self.retrieval_chain:
            try:
                result = self.retrieval_chain.invoke({
                    "question": question,
                    "chat_history": self.chat_history
                })
                response = result.get("answer", "I couldn't find a specific answer in the provided guide.")
                self.chat_history.append((question, response))
                return response
            except Exception:
                return self._fallback_processing(question, career_data)
        else:
            return self._fallback_processing(question, career_data)

    def _fallback_processing(self, question, career_data=None):
        """Fallback processing when RAG is not available or fails."""
        if self.career_system:
            return self.career_system.chat_with_assistant(question, career_data)
        else:
            return "The enhanced chat assistant could not be initialized. Please check your setup."
