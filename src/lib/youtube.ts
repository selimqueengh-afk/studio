
'use server';

import { type Reel } from './reels';

// IMPORTANT: The API key is temporarily hardcoded to resolve the ".env.local" loading issue.
// For production, it's highly recommended to use environment variables.
const YOUTUBE_API_KEY = 'AIzaSyC07W2GblkDf1aL9S2pSF4UVFQrSbliphY';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

// Search terms for diverse and interesting content
const SEARCH_QUERIES = [
  'GigaChad phonk edit',
  'Roblox Egor edit',
  'Roblox tutorial',
  'sigma rule edit',
  'funny roblox moments',
  'minecraft parkour',
];

// Function to fetch Shorts videos from YouTube Data API.
// To conserve API quota, it's highly recommended to use
// revalidation (caching) where this function is called.
export async function fetchYouTubeShorts(): Promise<Reel[]> {
  if (!YOUTUBE_API_KEY) {
    console.error(
      'YouTube API anahtarı (.env.local dosyasında YOUTUBE_API_KEY) bulunamadı.'
    );
    // Prevent app crash if API key is missing by returning an empty array.
    return [];
  }

  // Select a random search term each time to increase variety
  const randomQuery = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const encodedQuery = encodeURIComponent(`${randomQuery} #shorts`);

  const API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&videoDuration=short&q=${encodedQuery}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      // Hourly caching in Next.js App Router.
      // This makes API quota usage very efficient.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData.error.message);
      throw new Error(`YouTube API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    const reels: Reel[] = data.items
      .map((item: YouTubeVideo) => {
        // Sometimes videoId might be missing, filter those out
        if (!item.id.videoId) {
          return null;
        }
        return {
          id: item.id.videoId,
          videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          description: item.snippet.title,
          author: {
            nickname: item.snippet.channelTitle,
            avatar: item.snippet.thumbnails.default.url,
          },
        };
      })
      .filter((reel: Reel | null): reel is Reel => reel !== null); // Clean up null entries

    return reels;
  } catch (error) {
    console.error('Failed to fetch from YouTube API:', error);
    // Return an empty array in case of an error to allow the app to continue running.
    return [];
  }
}
