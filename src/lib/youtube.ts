
'use server';

import { type Reel } from './reels';

// Bu dosya, YouTube Data API v3 kullanarak veri çekmek için bir altyapı sağlar.
// Kotanın harcanmaması için, Next.js'in revalidate özelliği kullanılarak
// API istekleri sunucu tarafında saatte bir kez yapılacak şekilde ayarlanmıştır.

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Örnek olarak MrBeast kanalının ID'si
const CHANNEL_ID = 'UCX6OQ3DkcsbYNE6H8uQQuVA';

interface YouTubeApiResponse {
  items: {
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      thumbnails: {
        default: {
          url: string;
        };
        high?: {
          url: string;
        }
      };
    };
  }[];
}

/**
 * Belirtilen YouTube kanalından en son videoları (Shorts dahil) çeker.
 * 
 * DİKKAT: Bu fonksiyonun çalıştırılması YouTube API kotasını harcar.
 * Her bir `search.list` isteği yaklaşık 100 puan maliyetindedir.
 * next: { revalidate: 3600 } sayesinde bu istek saatte bir yapılır.
 */
export async function fetchYouTubeShorts(): Promise<Reel[]> {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API anahtarı (.env.local dosyasında YOUTUBE_API_KEY) bulunamadı.");
    // API anahtarı yoksa boş bir dizi döndürerek uygulamanın çökmesini engelle.
    return [];
  }

  // API'ye istek göndereceğimiz URL.
  // type=video -> sadece videoları getir
  // order=date -> en yeniden eskiye doğru sırala
  // maxResults=10 -> en fazla 10 video getir
  // channelId -> belirli bir kanaldan getir
  const url = `${YOUTUBE_API_URL}/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, {
        // Next.js'in veriyi önbelleğe almasını ve gereksiz API çağrılarını önlemesini sağlar.
        // Veriyi 1 saat (3600 saniye) boyunca önbellekte tutar ve kotayı korur.
        next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Hatası:', errorData.error.message);
      return [];
    }

    const data: YouTubeApiResponse = await response.json();

    if (!data.items) {
      console.error('YouTube API yanıtında "items" bulunamadı.');
      return [];
    }

    // API'den gelen veriyi uygulamamızın kullandığı `Reel` formatına dönüştür.
    return data.items.map((item) => ({
      id: item.id.videoId,
      videoUrl: `https://www.youtube.com/shorts/${item.id.videoId}`,
      description: item.snippet.description || item.snippet.title,
      author: {
        nickname: item.snippet.channelTitle,
        avatar: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      },
    }));

  } catch (error) {
    console.error('YouTube verileri çekilirken bir hata oluştu:', error);
    return [];
  }
}
