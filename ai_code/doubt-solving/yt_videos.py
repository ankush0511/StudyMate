# yt_videos.py
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build

load_dotenv()
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

def search_youtube(query, max_results=5, result_types=['video', 'playlist']): # Added result_types parameter
    """Searches YouTube for videos and/or playlists based on a query."""
    
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

        # Join the list of result types into a comma-separated string
        type_str = ','.join(result_types)

        search_response = youtube.search().list(
            q=query,
            part='snippet',
            maxResults=max_results,
            type=type_str # Use the combined type string here
        ).execute()

        videos_and_playlists = []
        for search_result in search_response.get('items', []):
            item_type = search_result['id']['kind']
            snippet = search_result['snippet']

            if item_type == 'youtube#video':
                video_id = search_result['id']['videoId']
                video_title = snippet['title']
                channel_name = snippet['channelTitle']
                video_link = f"https://www.youtube.com/watch?v={video_id}"
                videos_and_playlists.append({
                    'type': 'video', # Indicate type
                    'title': video_title, 
                    'link': video_link, 
                    'channel': channel_name 
                })
            elif item_type == 'youtube#playlist':
                playlist_id = search_result['id']['playlistId']
                playlist_title = snippet['title']
                channel_name = snippet['channelTitle']
                playlist_link = f"https://www.youtube.com/playlist?list={playlist_id}"
                videos_and_playlists.append({
                    'type': 'playlist', # Indicate type
                    'title': playlist_title, 
                    'link': playlist_link, 
                    'channel': channel_name 
                })
        
        return videos_and_playlists

    except Exception as e:
        print(f"An error occurred: {e}")
        return []