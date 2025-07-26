
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
    if (!apiData || !apiData.data || !apiData.data.itemList || !Array.isArray(apiData.data.itemList)) {
        return [];
    }
    return apiData.data.itemList.map((item: any) => ({
        id: item.id,
        description: item.desc,
        videoUrl: item.video.playAddr, // Using playAddr which is more reliable
        author: {
            nickname: item.author.uniqueId,
            avatar: item.author.avatarThumb,
        },
    }));
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        throw new Error('RapidAPI anahtarı veya host bilgisi eksik. Lütfen .env.local dosyasını kontrol edin.');
    }
    
    // Using the user posts endpoint as suggested by the user
    const url = new URL('https://tiktok-api23.p.rapidapi.com/api/user/posts');
    url.searchParams.append('secUid', 'MS4wLjABAAAAqB08cUbXaDWqbD6MCga2RbGTuhfO2EsHayBYx08NDrN7IE3jQuRDNNN6YwyfH6_6');
    url.searchParams.append('count', '12');
    url.searchParams.append('cursor', '0');

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
        }
    };

    try {
        const response = await fetch(url.toString(), options);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`API'den veri alınamadı: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON response from TikTok API:', responseText);
            throw new Error('TikTok API\'sinden gelen yanıt JSON formatında değil.');
        }

        return mapApiResponse(result);
    } catch (error) {
        console.error('TikTok akışı alınırken bir hata oluştu:', error);
        return []; // Hata durumunda boş bir dizi döndür
    }
};
