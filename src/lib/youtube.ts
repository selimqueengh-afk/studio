
'use server';

import { type Reel } from './reels';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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

// Çeşitli ve ilginç içerikler için arama terimleri
const SEARCH_QUERIES = [
  'GigaChad phonk edit',
  'Roblox Egor edit',
  'Roblox tutorial',
  'sigma rule edit',
  'funny roblox moments',
  'minecraft parkour',
];

// YouTube Data API'sinden Shorts videolarını çeken fonksiyon.
// API kotasını korumak için, bu fonksiyonun çağrıldığı yerde
// revalidate (önbellekleme) kullanılması şiddetle tavsiye edilir.
export async function fetchYouTubeShorts(): Promise<Reel[]> {
  if (!YOUTUBE_API_KEY) {
    console.error(
      'YouTube API anahtarı (.env.local dosyasında YOUTUBE_API_KEY) bulunamadı.'
    );
    // API anahtarı yoksa boş bir dizi döndürerek uygulamanın çökmesini engelle.
    return [];
  }

  // Her seferinde farklı bir arama terimi seçerek çeşitliliği artır
  const randomQuery = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const encodedQuery = encodeURIComponent(`${randomQuery} #shorts`);

  const API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&videoDuration=short&q=${encodedQuery}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      // Next.js App Router'da saatlik önbellekleme.
      // Bu, API kotasının çok verimli kullanılmasını sağlar.
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
        // Bazen videoId gelmeyebilir, bunları filtrele
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
      .filter((reel: Reel | null): reel is Reel => reel !== null); // null olanları temizle

    return reels;
  } catch (error) {
    console.error('Failed to fetch from YouTube API:', error);
    // Hata durumunda boş dizi döndürerek uygulamanın çalışmaya devam etmesini sağla.
    return [];
  }
}
