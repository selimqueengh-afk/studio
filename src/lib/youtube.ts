
'use server';

import { google } from 'googleapis';

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: string;
  description: string;
}

const YOUTUBE_API_KEY = "AIzaSyA-fOSZR_D_I5F4OS_TVT_HwEgkZI5GgrY";

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

const searchQueries = [
    'roblox sigma', 
    '"roblox funny"', 
    '"roblox egor"', 
    '"GigaChad"',
    '"manface roblox"'
];
const orderOptions: ('relevance' | 'viewCount' | 'date')[] = ['relevance', 'viewCount', 'date'];


export async function getYoutubeShorts(pageToken?: string): Promise<{ reels: Reel[], nextPageToken?: string, error?: string }> {
  try {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_API_KEY_HERE") {
      return { reels: [], error: "YouTube API anahtarı eksik veya geçersiz. Lütfen .env.local dosyanıza YOUTUBE_API_KEY ekleyin veya kodu doğrudan düzenleyin." };
    }
    
    // Select a random query and order for each request to get fresh content
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    const randomOrder = orderOptions[Math.floor(Math.random() * orderOptions.length)];

    const response = await youtube.search.list({
      part: ['snippet'],
      q: randomQuery,
      type: ['video'],
      maxResults: 10,
      videoDuration: 'short',
      order: randomOrder,
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
       return { reels: [], error: "YouTube API kotası aşıldı. Lütfen Google Cloud Console'u kontrol edin veya daha sonra tekrar deneyin." };
    }
     if (error.code === 400 || (error.errors && error.errors[0]?.reason.includes('keyInvalid'))) {
        return { reels: [], error: "Sağlanan YouTube API anahtarı geçersiz. Lütfen anahtarınızı kontrol edin." };
    }
    return { reels: [], error: 'YouTube videoları getirilirken genel bir hata oluştu.' };
  }
}
