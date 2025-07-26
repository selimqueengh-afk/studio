
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

// This function maps the API response to our Reel interface.
// NOTE: This is a guess based on common Instagram API structures.
// The actual structure from the /community endpoint is likely different and may not contain videos.
const mapApiResponse = (apiResponse: any): Reel[] => {
    if (!apiResponse || !apiResponse.data || !apiResponse.data.latest_posts) {
        console.warn("API response is not in the expected format or doesn't contain posts.", apiResponse);
        return [];
    }

    return apiResponse.data.latest_posts.map((post: any) => ({
        id: post.id,
        description: post.caption || 'No description',
        // IMPORTANT: The API might not provide a direct video URL. This is a placeholder.
        videoUrl: post.display_url || '', 
        author: {
            nickname: apiResponse.data.username || 'unknown',
            avatar: apiResponse.data.profile_pic_url || 'https://placehold.co/100x100.png',
        },
    }));
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const url = 'https://instagram-statistics-api.p.rapidapi.com/community?url=https%3A%2F%2Fwww.instagram.com%2Ftherock%2F';
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
        }
    };

    try {
        console.log(`Fetching from Instagram API: ${url}`);
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
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
        
        // Since this endpoint is for community stats, it likely won't return video posts.
        // We'll attempt to map it, but it will probably return an empty array.
        return mapApiResponse(result);

    } catch (error) {
        console.error('Instagram akışı alınırken bir hata oluştu:', error);
        // Return an empty array on error to prevent the page from crashing.
        return [];
    }
};
