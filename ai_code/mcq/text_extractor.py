# ai_code/mcq/text_extractor.py
import pypdf

def get_text_from_file(file_path):
    """Extracts text content from a given file (PDF, TXT, MD)."""
    text = ""
    try:
        if file_path.lower().endswith('.pdf'):
            with open(file_path, 'rb') as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        elif file_path.lower().endswith(('.txt', '.md')):
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            # You can add more supported types or return an error
            raise ValueError(f"Unsupported file type: {file_path.split('.')[-1]}")
            
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        raise
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        raise
        
    return text