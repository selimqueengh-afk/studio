
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

const videoIds = [
    "7306132438047116586",
    "7012345678901234567",
    "7034567890123456789",
    "7056789012345678901",
    "7098765432109876543",
    "7023456789012345678"
];


const mapApiResponse = (apiData: any): Reel | null => {
    if (!apiData || !apiData.data || !apiData.data.aweme_detail) {
        return null;
    }
    const item = apiData.data.aweme_detail;
    return {
        id: item.aweme_id,
        description: item.desc,
        videoUrl: item.video.play_addr.url_list[0],
        author: {
            nickname: item.author.unique_id,
            avatar: item.author.avatar_thumb.url_list[0],
        },
    };
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
        throw new Error('RapidAPI anahtarı veya host bilgisi eksik. Lütfen .env.local dosyasını kontrol edin.');
    }

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
        }
    };

    try {
        const promises = videoIds.map(videoId => {
            const url = `https://tiktok-api23.p.rapidapi.com/api/post/detail?videoId=${videoId}`;
            return fetch(url, options).then(response => {
                 if (!response.ok) {
                    console.error(`API Error for videoId ${videoId}: ${response.status} ${response.statusText}`);
                    return null; // Return null for failed requests
                }
                return response.json();
            });
        });

        const results = await Promise.all(promises);
        
        const reels = results
            .map(result => mapApiResponse(result))
            .filter((reel): reel is Reel => reel !== null); // Filter out any null results

        return reels;

    } catch (error) {
        console.error('TikTok akışı alınırken bir hata oluştu:', error);
        return [];
    }
};
