
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

// A static list of Instagram Reel URLs to fetch
const reelUrls = [
    'https://www.instagram.com/reel/C8_A388R5Fb/',
    'https://www.instagram.com/reel/C89Af6FRaQ3/',
    'https://www.instagram.com/reel/C8y4J5sxbJ8/',
    'https://www.instagram.com/reel/C8s5XoayQoq/',
    'https://www.instagram.com/reel/C8xL_9vSy2C/'
];

// This function maps the API response for a single reel to our Reel interface.
const mapApiResponse = (apiResponse: any, postUrl: string): Reel | null => {
    // The actual data seems to be nested under a 'data' property
    if (!apiResponse || !apiResponse.media) {
        // If the post is not a video or data is missing, skip it.
        return null;
    }

    // Generate a unique ID from the post URL
    const id = postUrl.split('/')[4] || new Date().getTime().toString();
    
    return {
        id: id,
        description: apiResponse.title || 'No description',
        videoUrl: apiResponse.media, // Direct video URL from the API response
        author: {
            nickname: 'Instagram User', // This API doesn't provide author details
            avatar: apiResponse.thumbnail || 'https://placehold.co/100x100.png',
        },
    };
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.error('RapidAPI Key is not configured.');
        return [];
    }

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com'
        }
    };

    try {
        const promises = reelUrls.map(postUrl => {
            const url = `https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(postUrl)}`;
            return fetch(url, options).then(async res => {
                if (!res.ok) {
                    // Log error but don't throw, so other requests can succeed
                    const errorText = await res.text();
                    console.error(`API Error for ${postUrl}: ${res.status} ${res.statusText}`, errorText);
                    return null;
                }
                const json = await res.json();
                return mapApiResponse(json, postUrl);
            }).catch(error => {
                console.error(`Fetch failed for ${postUrl}:`, error);
                return null;
            });
        });

        const results = await Promise.all(promises);
        
        const reels = results.filter((reel): reel is Reel => reel !== null); // Filter out any null values

        return reels;

    } catch (error) {
        console.error('Instagram akışı alınırken bir hata oluştu:', error);
        return []; // Return an empty array on catastrophic error
    }
};
