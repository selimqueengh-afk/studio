
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

// A list of Instagram post URLs to fetch
const postUrls = [
    'https://www.instagram.com/p/C8_A388R5Fb/',
    'https://www.instagram.com/p/C89Af6FRaQ3/',
    'https://www.instagram.com/p/C8y4J5sxbJ8/',
    'https://www.instagram.com/p/C8s5XoayQoq/',
    'https://www.instagram.com/p/C8xL_9vSy2C/'
];


// This function maps the API response for a single post to our Reel interface.
const mapApiResponse = (apiResponse: any): Reel | null => {
    // The actual data seems to be nested under a 'data' property
    const post = apiResponse?.data;
    if (!post || !post.id || !post.video_url) {
        // If the post is not a video or data is missing, skip it.
        return null;
    }

    return {
        id: post.id,
        description: post.caption || 'No description',
        videoUrl: post.video_url, // Direct video URL from the API response
        author: {
            nickname: post.owner?.username || 'unknown_user',
            avatar: post.owner?.profile_pic_url || 'https://placehold.co/100x100.png',
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
            'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
        }
    };

    try {
        const promises = postUrls.map(postUrl => {
            const url = `https://instagram-statistics-api.p.rapidapi.com/posts/one?postUrl=${encodeURIComponent(postUrl)}`;
            return fetch(url, options).then(res => {
                if (!res.ok) {
                    // Log error but don't throw, so other requests can succeed
                    console.error(`API Error for ${postUrl}: ${res.status} ${res.statusText}`);
                    return null;
                }
                return res.json();
            });
        });

        const results = await Promise.all(promises);
        
        const reels = results
            .map(result => result ? mapApiResponse(result) : null)
            .filter((reel): reel is Reel => reel !== null); // Filter out any null values

        return reels;

    } catch (error) {
        console.error('Instagram akışı alınırken bir hata oluştu:', error);
        return []; // Return an empty array on catastrophic error
    }
};

