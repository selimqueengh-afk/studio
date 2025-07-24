
'use server';

import { google } from 'googleapis';

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: string;
  description: string;
}

// TEMPORARY FIX: Using the key directly to bypass environment variable issues.
// Replace this with your actual API key.
const YOUTUBE_API_KEY = "AIzaSyCqEzmYFkSe2Ef5LbC-LLY6olXDmydZ-ek";

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

export async function getYoutubeShorts(pageToken?: string): Promise<{ reels: Reel[], nextPageToken?: string }> {
  try {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("YouTube API anahtarı eksik veya geçersiz. Lütfen .env.local dosyanıza YOUTUBE_API_KEY ekleyin.");
    }
    
    const response = await youtube.search.list({
      part: ['snippet'],
      q: '#shorts #funny #viral',
      type: ['video'],
      maxResults: 10,
      videoDuration: 'short',
      pageToken: pageToken,
    });

    const searchResults = response.data.items || [];

    const reels: Reel[] = searchResults.map(item => ({
      id: item.id?.videoId || '',
      videoUrl: `https://www.youtube.com/shorts/${item.id?.videoId}`,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
      author: item.snippet?.channelTitle || 'Unknown',
      description: item.snippet?.title || '',
    }));

    return {
        reels,
        nextPageToken: response.data.nextPageToken || undefined,
    };
  } catch (error: any) {
    console.error('Error fetching YouTube shorts:', error.message);
    if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error("Sağlanan YouTube API anahtarı geçersiz. Lütfen anahtarınızı kontrol edin.");
    }
     if (error.code === 403 || error.message.includes('quota')) {
      throw new Error("YouTube API kotası aşıldı veya API etkinleştirilmemiş. Lütfen Google Cloud Console'u kontrol edin.");
    }
    throw new Error('YouTube videoları getirilirken bir hata oluştu.');
  }
}
