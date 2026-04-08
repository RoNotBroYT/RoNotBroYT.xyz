import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // YouTube Data API v3 endpoint to fetch channel's latest videos
    const channelId = 'UCJBs52aMCadMm_dxJ2b4k0w'; // Replace with actual channel ID
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('YouTube API key is missing');
    }

    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube videos');
    }

    const data = await response.json();

    // Transform the data to match our component's expected format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      snippet: {
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      }
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Fallback to a static list of videos if API fails
    const fallbackVideos = [
      {
        id: 'dQw4w9WgXcQ',
        snippet: {
          title: 'Latest Video Placeholder',
          thumbnails: {
            medium: {
              url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
            }
          },
          publishedAt: new Date().toISOString()
        }
      }
    ];

    return NextResponse.json(fallbackVideos);
  }
} 