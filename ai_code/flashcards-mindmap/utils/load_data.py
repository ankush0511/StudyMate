import pypdf
import streamlit as st
import base64

def get_pdf_from_base64(base64_string, output_filename="output.pdf"):
    """
    Decodes a Base64 string and saves it as a PDF file.

    Args:
        base64_string (str): The Base64 encoded string of the PDF content.
        output_filename (str, optional): The name of the PDF file to be created.
                                         Defaults to "output.pdf".

    Returns:
        str: The path to the saved PDF file if successful, None otherwise.
    """
    try:
        # Decode the Base64 string into bytes
        pdf_bytes = base64.b64decode(base64_string)

        # Write the bytes to a file in binary write mode ('wb')
        with open(output_filename, 'wb') as pdf_file:
            pdf_file.write(pdf_bytes)

        print(f"PDF successfully saved as '{output_filename}'")
        return output_filename
    except Exception as e:
        print(f"Error converting Base64 to PDF: {e}")
        return None
    
def extract_text_from_pdf(pdf_file) -> str:
    """
    Extracts text from an uploaded PDF file.
    """
    try:
        pdf_reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
        return text
    except Exception as e:
        st.error(f"Error reading PDF file: {e}")
        return ""