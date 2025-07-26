
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

// The API seems to require full TikTok post URLs.
const TIKTOK_VIDEO_URLS = [
    'https://www.tiktok.com/@tiktok/video/7391753673432321326',
    'https://www.tiktok.com/@tiktok/video/7388739172085730606',
    'https://www.tiktok.com/@google/video/7355135759942405419',
    'https://www.tiktok.com/@nasa/video/7388755953331899691',
    'https://www.tiktok.com/@espn/video/7392815777329237291',
];

interface ScraperApiResponse {
    code: number;
    msg: string;
    processed_time: number;
    data: {
        id: string;
        region: string;
        title: string;
        cover: string;
        origin_cover: string;
        duration: number;
        play: string; // This should be the video URL
        wm_play: string;
        hd_play: string;
        music: string;
        music_info: {
            id: string;
            title: string;
            play: string;
            cover: string;
            author: string;
            original: boolean;
            duration: number;
            album: string;
        };
        play_count: number;
        digg_count: number;
        comment_count: number;
        share_count: number;
        download_count: number;
        create_time: number;
        author: {
            id: string;
            unique_id: string; // nickname
            nickname: string;
            avatar: string; // avatar
        };
        images?: string[];
    }
}


const mapApiResponse = (response: ScraperApiResponse): Reel | null => {
    if (response.code !== 0 || !response.data) {
        return null;
    }
    const { data } = response;
    return {
        id: data.id,
        description: data.title,
        // Use the no-watermark video if available, otherwise fallback to the standard play URL
        videoUrl: data.hd_play || data.play,
        author: {
            nickname: data.author.unique_id || data.author.nickname,
            avatar: data.author.avatar,
        },
    };
};

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    const host = process.env.RAPIDAPI_HOST;
    const key = process.env.RAPIDAPI_KEY;

    if (!host || !key) {
        console.error('RapidAPI host or key is not set in environment variables.');
        return [];
    }

    const fetchedReels: Reel[] = [];

    // Use a for...of loop to send requests sequentially and avoid rate limiting.
    for (const postUrl of TIKTOK_VIDEO_URLS) {
        try {
            const url = `https://${host}/?url=${encodeURIComponent(postUrl)}&hd=1`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': host,
                },
                 // Increase timeout as these scraper APIs can be slow
                next: { revalidate: 60 * 60 } // Cache for 1 hour
            };

            const res = await fetch(url, options);

            if (!res.ok) {
                 const errorText = await res.text();
                 console.error(`API Error for ${postUrl}: ${res.status} ${res.statusText}`, errorText);
                 continue; // Skip to the next video
            }

            const json: ScraperApiResponse = await res.json();
            const reel = mapApiResponse(json);

            if (reel) {
                fetchedReels.push(reel);
            }
        } catch (error) {
            console.error(`Failed to fetch reel for ${postUrl}:`, error);
        }
    }

    if (fetchedReels.length === 0) {
        console.warn('The fetched reels list is empty.');
    }

    return fetchedReels;
};
