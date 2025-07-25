
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
// This is not recommended for production.
const YOUTUBE_API_KEY = "AIzaSyCqEzmYFkSe2Ef5LbC-LLY6olXDmydZ-ek";

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

export async function getYoutubeShorts(pageToken?: string): Promise<{ reels: Reel[], nextPageToken?: string }> {
  try {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("YouTube API anahtarı eksik veya geçersiz. Lütfen .env.local dosyanıza YOUTUBE_API_KEY ekleyin veya kodu doğrudan düzenleyin.");
    }
    
    const response = await youtube.search.list({
      part: ['snippet'],
      q: '"roblox egor" | "gigachad" | "roblox manface" #shorts -girl',
      type: ['video'],
      maxResults: 10,
      videoDuration: 'short',
      pageToken: pageToken,
    });

    const searchResults = response.data.items || [];
    
    if (!searchResults.length) {
      return { reels: [], nextPageToken: undefined };
    }

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
    console.error('Error fetching YouTube shorts:', JSON.stringify(error, null, 2));
    if (error.code === 403 || (error.errors && error.errors[0]?.reason.includes('quotaExceeded'))) {
       throw new Error("YouTube API kotası aşıldı. Lütfen Google Cloud Console'u kontrol edin veya daha sonra tekrar deneyin.");
    }
     if (error.code === 400 || (error.errors && error.errors[0]?.reason.includes('keyInvalid'))) {
       throw new Error("Sağlanan YouTube API anahtarı geçersiz. Lütfen anahtarınızı kontrol edin.");
    }
    throw new Error('YouTube videoları getirilirken genel bir hata oluştu.');
  }
}
