"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Youtube, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    publishedAt: string;
  };
}

export function YouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      console.log('Starting to fetch videos...');

      try {
        console.log('Fetching YouTube videos...');
        const youtubeResponse = await fetch('/api/youtube-videos');
        
        if (!youtubeResponse.ok) {
          console.error('YouTube API Error:', youtubeResponse.status, youtubeResponse.statusText);
          const errorText = await youtubeResponse.text();
          console.error('Error details:', errorText);
          throw new Error(`YouTube API error: ${youtubeResponse.status}`);
        }

        const youtubeData = await youtubeResponse.json();
        console.log('YouTube data received:', youtubeData);
        setVideos(youtubeData.slice(0, 2));

      } catch (err) {
        console.error('Error in fetchVideos:', err);
        setYoutubeError('Failed to load videos');
      } finally {
        setIsLoading(false);
        console.log('Fetch completed');
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center">
            <Youtube className="mr-2 text-red-600 size-5" /> Latest Videos
          </h2>
          
          {youtubeError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{youtubeError}</AlertDescription>
            </Alert>
          ) : videos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No videos available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <img 
                    src={video.snippet.thumbnails.medium.url} 
                    alt={video.snippet.title} 
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-base mb-2 line-clamp-2">
                      {video.snippet.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.snippet.publishedAt).toLocaleDateString()}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          console.log('Opening YouTube video:', video.id);
                          window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
                        }}
                        className="h-7 px-2"
                      >
                        Watch
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-3">
            <Button 
              asChild 
              variant="link"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <a href="https://www.youtube.com/@RoNotBroYT" target="_blank" rel="noopener noreferrer">
                View All Videos
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouTubeVideos;