# You need to install the Google API client library first:
# pip install --upgrade google-api-python-client


# --- IMPORTANT ---
# Replace this with the API key you generated from the Google Cloud Console
YOUTUBE_API_KEY = "AIzaSyDNR-Xv5iHGtUMGlsFF6L7WMjk7OSWc3M8" 



if __name__ == "__main__":
    search_topic = "deep learning tutorials"
    found_videos = search_youtube(search_topic)

    if found_videos:
        print(f"Found videos for '{search_topic}':\n")
        for video in found_videos:
            print(f"Title: {video['title']}")
            print(f"Link: {video['link']}\n")
    else:
        print("Could not find any videos or an error occurred.")