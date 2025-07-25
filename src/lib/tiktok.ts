
'use server';

import 'server-only';

export interface Reel {
    id: string;
    description: string;
    videoUrl: string;
    author: {
        nickname: string;
        avatar: string;
    };
}

const mapApiResponse = (apiData: any): Reel[] => {
    if (!apiData || !apiData.aweme_list || !Array.isArray(apiData.aweme_list)) {
        return [];
    }
    return apiData.aweme_list.map((item: any) => ({
        id: item.aweme_id,
        description: item.desc,
        videoUrl: item.video.play_addr.url_list[0],
        author: {
            nickname: item.author.nickname,
            avatar: item.author.avatar_thumb.url_list[0],
        },
    }));
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        throw new Error('RapidAPI anahtarı veya host bilgisi eksik. Lütfen .env.local dosyasını kontrol edin.');
    }
    
    const url = 'https://tiktok-api23.p.rapidapi.com/aweme/v1/feed/';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`API'den veri alınamadı: ${response.statusText}`);
        }
        const result = await response.json();
        return mapApiResponse(result);
    } catch (error) {
        console.error('TikTok akışı alınırken bir hata oluştu:', error);
        return []; // Hata durumunda boş bir dizi döndür
    }
};
