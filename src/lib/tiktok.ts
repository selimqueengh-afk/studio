
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

// This function maps the complex API response to our simple Reel interface.
function mapApiResponse(apiResponse: any): Reel[] {
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) {
        console.warn("API response is not in the expected format or data is not an array:", apiResponse);
        return [];
    }

    return apiResponse.data.map((item: any) => ({
        id: item.id,
        description: item.desc,
        videoUrl: item.video.playAddr,
        author: {
            nickname: item.author.uniqueId,
            avatar: item.author.avatarThumb,
        },
    }));
}


export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    // This is the correct endpoint for trending posts as provided by the user.
    const url = 'https://tiktok-api23.p.rapidapi.com/api/post/trending?count=16';
    
    // These are the required headers for RapidAPI authentication.
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
        }
    };

    try {
        console.log(`Fetching trending TikTok videos from: ${url}`);
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`API'den veri alınamadı: ${response.statusText}`);
        }

        const responseText = await response.text();
        if (!responseText) {
            console.warn('TikTok API returned an empty response.');
            return [];
        }

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
        // In case of an error, return an empty array to prevent the app from crashing.
        return [];
    }
};
