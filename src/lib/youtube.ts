
'use server';

import { google } from 'googleapis';

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: string;
  description: string;
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // Your API key from Google Cloud Console
});

export async function getYoutubeShorts(pageToken?: string): Promise<{ reels: Reel[], nextPageToken?: string }> {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("YouTube API anahtarı eksik veya geçersiz. Lütfen .env.local dosyanıza YOUTUBE_API_KEY ekleyin.");
    }
    
    const response = await youtube.search.list({
      part: ['snippet'],
      q: '#shorts #funny #viral', // Search query for popular, funny, viral shorts
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
    console.error('Error fetching YouTube shorts:', error);
    // Check if the error is due to a missing API key
    if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        throw new Error("YouTube API anahtarı eksik veya geçersiz. Lütfen .env.local dosyanızı ve anahtarınızı kontrol edin.");
    }
     if (error.code === 403) {
      throw new Error("YouTube API kotası aşıldı veya API etkinleştirilmemiş. Lütfen Google Cloud Console'u kontrol edin.");
    }
    throw new Error('YouTube videoları getirilirken bir hata oluştu.');
  }
}
