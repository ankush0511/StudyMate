# First, you need to install the required library.
# Open your terminal or command prompt and run:
# pip install youtube-search-python

from youtubesearchpython import VideosSearch

def search_youtube_and_get_links(search_query: str, limit: int = 5) -> list[str]:
    """
    Searches YouTube for a given query and returns a list of video links.

    Args:
        search_query: The string to search for on YouTube (e.g., "python tutorials").
        limit: The maximum number of results to return. Defaults to 5.

    Returns:
        A list of strings, where each string is a URL to a YouTube video.
        Returns an empty list if no results are found or an error occurs.
    """
    if not search_query:
        print("Error: Search query cannot be empty.")
        return []

    try:
        # Perform the search with the given query and limit
        videos_search = VideosSearch(search_query, limit=limit)
        results = videos_search.result()

        # Extract the video link from each result item
        links = [video['link'] for video in results['result']]
        
        return links
    except Exception as e:
        print(f"An error occurred during the YouTube search: {e}")
        return []

# --- Example Usage ---
if __name__ == "__main__":
    # Get a search term from the user
    query = input("What would you like to search for on YouTube? ")
    
    print(f"\nSearching YouTube for '{query}'...")
    
    # Call the function to get the video links
    video_links = search_youtube_and_get_links(query, limit=5)
    
    if video_links:
        print(f"\nFound {len(video_links)} links:")
        # Print each link with a number
        for i, link in enumerate(video_links, 1):
            print(f"{i}. {link}")
    else:
        print("Could not find any videos for that search term.")
